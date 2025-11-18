from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
from ..database import get_supabase

router = APIRouter(prefix="/api/einkaufs", tags=["einkaufs"])

# ============= Pydantic Models =============

class SupplierCreate(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = "Deutschland"
    notes: Optional[str] = None

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    rating: Optional[int] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class SupplierItemCreate(BaseModel):
    supplier_id: str
    item_id: str
    unit_price: float
    lead_time_days: Optional[int] = None
    min_order_quantity: Optional[float] = None
    notes: Optional[str] = None

class PurchaseOrderItemCreate(BaseModel):
    item_id: str
    quantity: float
    unit: str
    unit_price: float
    notes: Optional[str] = None

class PurchaseOrderCreate(BaseModel):
    supplier_id: str
    expected_delivery_date: Optional[date] = None
    notes: Optional[str] = None
    items: List[PurchaseOrderItemCreate]

class PurchaseOrderUpdate(BaseModel):
    status: Optional[str] = None
    expected_delivery_date: Optional[date] = None
    actual_delivery_date: Optional[date] = None
    notes: Optional[str] = None

class DeliveryRecordCreate(BaseModel):
    po_id: str
    item_id: str
    quantity_received: float
    quality_check_passed: bool
    notes: Optional[str] = None

# ============= Supplier Endpoints =============

@router.get("/suppliers")
async def get_suppliers(
    is_active: Optional[bool] = None,
    db=Depends(get_supabase)
):
    """Get all suppliers"""
    try:
        query = db.table("suppliers").select("*").order("name")

        if is_active is not None:
            query = query.eq("is_active", is_active)

        result = query.execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/suppliers/{supplier_id}")
async def get_supplier(supplier_id: str, db=Depends(get_supabase)):
    """Get supplier details"""
    try:
        result = db.table("suppliers").select("*").eq("id", supplier_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Supplier not found")

        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suppliers")
async def create_supplier(supplier: SupplierCreate, db=Depends(get_supabase)):
    """Create new supplier"""
    try:
        result = db.table("suppliers").insert(supplier.dict()).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/suppliers/{supplier_id}")
async def update_supplier(
    supplier_id: str,
    supplier: SupplierUpdate,
    db=Depends(get_supabase)
):
    """Update supplier"""
    try:
        update_data = {k: v for k, v in supplier.dict().items() if v is not None}

        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")

        result = db.table("suppliers").update(update_data).eq("id", supplier_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Supplier not found")

        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/suppliers/{supplier_id}/items")
async def get_supplier_items(supplier_id: str, db=Depends(get_supabase)):
    """Get all items for a supplier with pricing"""
    try:
        result = db.table("supplier_items").select(
            "*, items(*)"
        ).eq("supplier_id", supplier_id).execute()

        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/supplier-items")
async def create_supplier_item(
    supplier_item: SupplierItemCreate,
    db=Depends(get_supabase)
):
    """Add item pricing for supplier"""
    try:
        result = db.table("supplier_items").insert(supplier_item.dict()).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= Purchase Order Endpoints =============

@router.get("/purchase-orders")
async def get_purchase_orders(
    status: Optional[str] = None,
    supplier_id: Optional[str] = None,
    db=Depends(get_supabase)
):
    """Get all purchase orders"""
    try:
        query = db.table("purchase_order_details").select("*").order("created_at", desc=True)

        if status:
            query = query.eq("status", status)
        if supplier_id:
            query = query.eq("supplier_id", supplier_id)

        result = query.execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/purchase-orders/{po_id}")
async def get_purchase_order(po_id: str, db=Depends(get_supabase)):
    """Get purchase order details"""
    try:
        result = db.table("purchase_order_details").select("*").eq("id", po_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Purchase order not found")

        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/purchase-orders")
async def create_purchase_order(
    po: PurchaseOrderCreate,
    created_by: str,
    db=Depends(get_supabase)
):
    """Create new purchase order"""
    try:
        if not po.items or len(po.items) == 0:
            raise HTTPException(status_code=400, detail="Purchase order must have at least one item")

        # Calculate total amount
        total_amount = sum(item.quantity * item.unit_price for item in po.items)

        # Get next PO number
        po_number_result = db.rpc("generate_po_number").execute()
        po_number = po_number_result.data

        # Create purchase order
        po_data = {
            "order_number": po_number,
            "supplier_id": po.supplier_id,
            "expected_delivery_date": po.expected_delivery_date.isoformat() if po.expected_delivery_date else None,
            "total_amount": total_amount,
            "notes": po.notes,
            "created_by": created_by,
            "status": "draft"
        }

        po_result = db.table("purchase_orders").insert(po_data).execute()

        if not po_result.data:
            raise HTTPException(status_code=500, detail="Failed to create purchase order")

        po_id = po_result.data[0]["id"]

        # Create purchase order items
        items_data = [
            {
                "po_id": po_id,
                "item_id": item.item_id,
                "quantity": item.quantity,
                "unit": item.unit,
                "unit_price": item.unit_price,
                "total_price": item.quantity * item.unit_price,
                "notes": item.notes
            }
            for item in po.items
        ]

        db.table("purchase_order_items").insert(items_data).execute()

        # Get complete PO with details
        result = db.table("purchase_order_details").select("*").eq("id", po_id).execute()

        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/purchase-orders/{po_id}")
async def update_purchase_order(
    po_id: str,
    po: PurchaseOrderUpdate,
    db=Depends(get_supabase)
):
    """Update purchase order"""
    try:
        update_data = {}

        if po.status is not None:
            update_data["status"] = po.status
        if po.expected_delivery_date is not None:
            update_data["expected_delivery_date"] = po.expected_delivery_date.isoformat()
        if po.actual_delivery_date is not None:
            update_data["actual_delivery_date"] = po.actual_delivery_date.isoformat()
        if po.notes is not None:
            update_data["notes"] = po.notes

        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")

        result = db.table("purchase_orders").update(update_data).eq("id", po_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Purchase order not found")

        # Get complete PO with details
        po_result = db.table("purchase_order_details").select("*").eq("id", po_id).execute()

        return po_result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/purchase-orders/{po_id}/confirm")
async def confirm_purchase_order(po_id: str, db=Depends(get_supabase)):
    """Confirm and submit purchase order"""
    try:
        result = db.table("purchase_orders").update({
            "status": "ordered",
            "ordered_at": datetime.utcnow().isoformat()
        }).eq("id", po_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Purchase order not found")

        return {"success": True, "message": "Purchase order confirmed"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= Low Stock & Purchase Requests =============

@router.get("/low-stock")
async def get_low_stock_items(db=Depends(get_supabase)):
    """Get items with low stock"""
    try:
        result = db.table("low_stock_items").select("*").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/purchase-requests")
async def get_purchase_requests(
    status: Optional[str] = None,
    db=Depends(get_supabase)
):
    """Get purchase requests"""
    try:
        query = db.table("purchase_requests").select(
            "*, items(*)"
        ).order("created_at", desc=True)

        if status:
            query = query.eq("status", status)

        result = query.execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/purchase-requests/{request_id}/convert")
async def convert_request_to_po(
    request_id: str,
    supplier_id: str,
    created_by: str,
    db=Depends(get_supabase)
):
    """Convert purchase request to purchase order"""
    try:
        # Get purchase request
        req_result = db.table("purchase_requests").select(
            "*, items(*)"
        ).eq("id", request_id).execute()

        if not req_result.data:
            raise HTTPException(status_code=404, detail="Purchase request not found")

        request = req_result.data[0]

        # Get supplier item pricing
        supplier_item = db.table("supplier_items").select("*").eq(
            "supplier_id", supplier_id
        ).eq("item_id", request["item_id"]).execute()

        if not supplier_item.data:
            raise HTTPException(status_code=400, detail="Supplier does not offer this item")

        unit_price = supplier_item.data[0]["unit_price"]

        # Create PO
        po_data = PurchaseOrderCreate(
            supplier_id=supplier_id,
            notes=f"Generated from purchase request {request_id}",
            items=[
                PurchaseOrderItemCreate(
                    item_id=request["item_id"],
                    quantity=request["quantity_needed"],
                    unit=request["items"]["unit"],
                    unit_price=unit_price
                )
            ]
        )

        po = await create_purchase_order(po_data, created_by, db)

        # Update request status
        db.table("purchase_requests").update({
            "status": "converted",
            "po_id": po["id"]
        }).eq("id", request_id).execute()

        return po
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= Delivery Records =============

@router.post("/deliveries")
async def create_delivery_record(
    delivery: DeliveryRecordCreate,
    received_by: str,
    db=Depends(get_supabase)
):
    """Record item delivery"""
    try:
        delivery_data = {
            **delivery.dict(),
            "received_by": received_by
        }

        result = db.table("delivery_records").insert(delivery_data).execute()

        # If quality check passed, update inventory
        if delivery.quality_check_passed:
            # Get item details
            po_item = db.table("purchase_order_items").select(
                "*, items(*)"
            ).eq("po_id", delivery.po_id).eq("item_id", delivery.item_id).execute()

            if po_item.data:
                item = po_item.data[0]["items"]
                new_stock = item["current_stock"] + delivery.quantity_received

                db.table("items").update({
                    "current_stock": new_stock
                }).eq("id", delivery.item_id).execute()

        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= Statistics =============

@router.get("/stats")
async def get_einkaufs_stats(db=Depends(get_supabase)):
    """Get purchasing statistics"""
    try:
        # Low stock count
        low_stock = db.table("low_stock_items").select("id", count="exact").execute()

        # Active POs
        active_pos = db.table("purchase_orders").select(
            "id", count="exact"
        ).in_("status", ["draft", "ordered", "shipping"]).execute()

        # Total suppliers
        suppliers = db.table("suppliers").select(
            "id", count="exact"
        ).eq("is_active", True).execute()

        # Pending requests
        pending_requests = db.table("purchase_requests").select(
            "id", count="exact"
        ).eq("status", "pending").execute()

        return {
            "low_stock_count": low_stock.count,
            "active_po_count": active_pos.count,
            "active_supplier_count": suppliers.count,
            "pending_request_count": pending_requests.count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
