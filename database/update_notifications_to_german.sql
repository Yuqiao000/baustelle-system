-- ============================================
-- Update notification trigger function - Change to German
-- ============================================

CREATE OR REPLACE FUNCTION create_notification_on_request()
RETURNS TRIGGER AS $$
DECLARE
  lager_user RECORD;
  notification_title TEXT;
  notification_message TEXT;
  status_text TEXT;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Notify all warehouse managers when worker creates a request
    notification_title := 'Neue Anfrage';
    notification_message := 'Anfrage ' || NEW.request_number || ' wurde erstellt';

    FOR lager_user IN SELECT id FROM profiles WHERE role IN ('lager', 'admin')
    LOOP
      INSERT INTO notifications (user_id, title, message, type, related_request_id)
      VALUES (lager_user.id, notification_title, notification_message, 'request', NEW.id);
    END LOOP;

  ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Notify worker when status changes
    -- Convert status to German
    status_text := CASE NEW.status
      WHEN 'pending' THEN 'Ausstehend'
      WHEN 'confirmed' THEN 'Bestätigt'
      WHEN 'preparing' THEN 'In Vorbereitung'
      WHEN 'ready' THEN 'Bereit'
      WHEN 'shipped' THEN 'Versandt'
      WHEN 'completed' THEN 'Abgeschlossen'
      WHEN 'cancelled' THEN 'Storniert'
      ELSE NEW.status
    END;

    notification_title := 'Anfragestatus aktualisiert';
    notification_message := 'Anfrage ' || NEW.request_number || ' Status wurde aktualisiert auf: ' || status_text;

    INSERT INTO notifications (user_id, title, message, type, related_request_id)
    VALUES (NEW.worker_id, notification_title, notification_message, 'status_change', NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
