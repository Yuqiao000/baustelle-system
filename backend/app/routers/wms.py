"""
WMS (仓库管理系统) API路由
包含库存管理、出入库操作、条码扫描等功能
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from ..database import get_supabase

router = APIRouter(prefix="/api/wms", tags=["wms"])


# ============ Pydantic 模型 ============

class StorageLocationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    zone: Optional[str] = None


class StorageLocation(BaseModel):
    id: str
    name: str
    description: Optional[str]
    zone: Optional[str]
    is_active: bool
    created_at: datetime


class InventoryCreate(BaseModel):
    item_id: str
    location_id: str
    quantity: float


class Inventory(BaseModel):
    id: str
    item_id: str
    location_id: str
    quantity: float
    created_at: datetime
    updated_at: datetime


class InventoryTransactionCreate(BaseModel):
    item_id: str
    location_id: str
    transaction_type: str  # 'in', 'out', 'adjust', 'initial'
    quantity: float
    operator_id: str
    notes: Optional[str] = None
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None


class InventoryTransaction(BaseModel):
    id: str
    item_id: str
    location_id: str
    transaction_type: str
    quantity: float
    before_quantity: Optional[float]
    after_quantity: Optional[float]
    operator_id: str
    notes: Optional[str]
    created_at: datetime


class BarcodeSearchResponse(BaseModel):
    found: bool
    item: Optional[dict] = None
    current_stock: Optional[float] = None
    locations: Optional[List[dict]] = None


class PurchaseRequestCreate(BaseModel):
    item_id: str
    quantity: float
    reason: str
    created_by: str


class PurchaseRequest(BaseModel):
    id: str
    request_number: str
    item_id: str
    quantity: float
    reason: str
    status: str
    created_by: str
    created_at: datetime


# ============ 库位管理 API ============

@router.get("/locations", response_model=List[StorageLocation])
async def get_storage_locations(
    is_active: Optional[bool] = None,
    db=Depends(get_supabase)
):
    """获取所有库位"""
    query = db.table("storage_locations").select("*")
    if is_active is not None:
        query = query.eq("is_active", is_active)
    result = query.order("name").execute()
    return result.data


@router.post("/locations", response_model=StorageLocation)
async def create_storage_location(location: StorageLocationCreate, db=Depends(get_supabase)):
    """创建新库位"""
    result = db.table("storage_locations").insert(location.dict()).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create storage location")
    return result.data[0]


# ============ 条码扫描 API ============

@router.get("/barcode/{barcode}", response_model=BarcodeSearchResponse)
async def search_by_barcode(barcode: str, db=Depends(get_supabase)):
    """通过条码搜索物料"""
    # 查找物料
    item_result = db.table("items").select("*").eq("barcode", barcode).execute()

    if not item_result.data:
        return BarcodeSearchResponse(found=False)

    item = item_result.data[0]

    # 查找该物料的所有库存位置
    inventory_result = (
        db.table("inventory")
        .select("*, storage_locations(*)")
        .eq("item_id", item["id"])
        .execute()
    )

    locations = []
    for inv in inventory_result.data:
        locations.append({
            "location_id": inv["location_id"],
            "location_name": inv["storage_locations"]["name"] if inv.get("storage_locations") else None,
            "quantity": inv["quantity"]
        })

    return BarcodeSearchResponse(
        found=True,
        item=item,
        current_stock=item.get("current_stock", 0),
        locations=locations
    )


# ============ 库存查询 API ============

@router.get("/inventory")
async def get_inventory(
    item_id: Optional[str] = None,
    location_id: Optional[str] = None,
    db=Depends(get_supabase)
):
    """获取库存信息"""
    query = db.table("inventory").select("*, items(*), storage_locations(*)")

    if item_id:
        query = query.eq("item_id", item_id)
    if location_id:
        query = query.eq("location_id", location_id)

    result = query.execute()
    return result.data


@router.get("/inventory/summary")
async def get_inventory_summary(db=Depends(get_supabase)):
    """获取库存摘要（使用视图）"""
    result = db.table("inventory_summary").select("*").execute()
    return result.data


@router.get("/inventory/low-stock")
async def get_low_stock_items(db=Depends(get_supabase)):
    """获取低库存物料"""
    result = db.table("low_stock_items").select("*").execute()
    return result.data


# ============ 出入库操作 API ============

@router.post("/transactions", response_model=InventoryTransaction)
async def create_transaction(transaction: InventoryTransactionCreate, db=Depends(get_supabase)):
    """创建出入库记录"""
    # 1. 获取当前库存
    inventory_result = (
        db.table("inventory")
        .select("*")
        .eq("item_id", transaction.item_id)
        .eq("location_id", transaction.location_id)
        .execute()
    )

    current_quantity = inventory_result.data[0]["quantity"] if inventory_result.data else 0

    # 2. 计算新库存
    if transaction.transaction_type == "in" or transaction.transaction_type == "initial":
        new_quantity = current_quantity + transaction.quantity
    elif transaction.transaction_type == "out":
        new_quantity = current_quantity - transaction.quantity
        if new_quantity < 0:
            raise HTTPException(status_code=400, detail="Insufficient stock")
    elif transaction.transaction_type == "adjust":
        new_quantity = transaction.quantity
    else:
        raise HTTPException(status_code=400, detail="Invalid transaction type")

    # 3. 更新或创建库存记录
    if inventory_result.data:
        # 更新现有库存
        db.table("inventory").update({"quantity": new_quantity}).eq("item_id", transaction.item_id).eq("location_id", transaction.location_id).execute()
    else:
        # 创建新库存记录
        db.table("inventory").insert({
            "item_id": transaction.item_id,
            "location_id": transaction.location_id,
            "quantity": new_quantity
        }).execute()

    # 4. 记录交易历史
    transaction_data = transaction.dict()
    transaction_data["before_quantity"] = current_quantity
    transaction_data["after_quantity"] = new_quantity

    result = db.table("inventory_transactions").insert(transaction_data).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create transaction")

    return result.data[0]


@router.get("/transactions", response_model=List[InventoryTransaction])
async def get_transactions(
    item_id: Optional[str] = None,
    operator_id: Optional[str] = None,
    limit: int = 50,
    db=Depends(get_supabase)
):
    """获取出入库记录"""
    query = db.table("inventory_transactions").select("*").order("created_at", desc=True).limit(limit)

    if item_id:
        query = query.eq("item_id", item_id)
    if operator_id:
        query = query.eq("operator_id", operator_id)

    result = query.execute()
    return result.data


# ============ 采购申请 API ============

@router.post("/purchase-requests", response_model=PurchaseRequest)
async def create_purchase_request(request: PurchaseRequestCreate, db=Depends(get_supabase)):
    """创建采购申请"""
    # 生成申请编号
    number_result = db.rpc("generate_purchase_request_number").execute()
    request_number = number_result.data

    request_data = request.dict()
    request_data["request_number"] = request_number
    request_data["status"] = "pending"

    result = db.table("purchase_requests").insert(request_data).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create purchase request")

    return result.data[0]


@router.get("/purchase-requests", response_model=List[PurchaseRequest])
async def get_purchase_requests(
    status: Optional[str] = None,
    db=Depends(get_supabase)
):
    """获取采购申请列表"""
    query = db.table("purchase_requests").select("*").order("created_at", desc=True)

    if status:
        query = query.eq("status", status)

    result = query.execute()
    return result.data


@router.patch("/purchase-requests/{request_id}/status")
async def update_purchase_request_status(
    request_id: str,
    status: str,
    db=Depends(get_supabase)
):
    """更新采购申请状态"""
    valid_statuses = ["pending", "approved", "ordered", "received", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    result = db.table("purchase_requests").update({"status": status}).eq("id", request_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Purchase request not found")

    return result.data[0]


# ============ 批量初始化库存 API ============

@router.post("/inventory/bulk-init")
async def bulk_init_inventory(
    items: List[dict],  # [{ item_id, location_id, quantity, operator_id }]
    db=Depends(get_supabase)
):
    """批量初始化库存（首次盘点）"""
    results = []

    for item in items:
        try:
            transaction = InventoryTransactionCreate(
                item_id=item["item_id"],
                location_id=item["location_id"],
                transaction_type="initial",
                quantity=item["quantity"],
                operator_id=item["operator_id"],
                notes="初始盘点录入"
            )
            result = await create_transaction(transaction, db)
            results.append({"success": True, "item_id": item["item_id"], "data": result})
        except Exception as e:
            results.append({"success": False, "item_id": item["item_id"], "error": str(e)})

    return {"total": len(items), "results": results}
