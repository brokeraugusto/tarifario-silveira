-- Fix remaining function search path issues

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, created_by)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'reception',
    NEW.id
  );
  RETURN NEW;
END;
$function$;

-- Fix generate_maintenance_order_number function
CREATE OR REPLACE FUNCTION public.generate_maintenance_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
    next_number INTEGER;
    year_part TEXT;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 6) AS INTEGER)), 0) + 1
    INTO next_number
    FROM maintenance_orders
    WHERE order_number LIKE year_part || '-%';
    
    NEW.order_number := year_part || '-' || LPAD(next_number::TEXT, 4, '0');
    RETURN NEW;
END;
$function$;

-- Fix create_maintenance_order_on_block function
CREATE OR REPLACE FUNCTION public.create_maintenance_order_on_block()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  area_id_var UUID;
  user_id_var UUID;
BEGIN
  -- Verificar se está sendo bloqueada por manutenção
  IF NEW.is_blocked = true AND (NEW.block_reason = 'maintenance' OR NEW.block_reason = 'Manutenção') AND 
     (OLD.is_blocked IS NULL OR OLD.is_blocked = false) THEN
    
    -- Buscar a área correspondente à acomodação
    SELECT id INTO area_id_var FROM areas 
    WHERE accommodation_id = NEW.id AND area_type = 'accommodation' 
    LIMIT 1;
    
    -- Se não encontrar área, criar uma
    IF area_id_var IS NULL THEN
      INSERT INTO areas (name, code, area_type, accommodation_id, description)
      VALUES (NEW.name, NEW.room_number, 'accommodation', NEW.id, 'Área da acomodação ' || NEW.name)
      RETURNING id INTO area_id_var;
    END IF;
    
    -- Obter o usuário atual
    SELECT auth.uid() INTO user_id_var;
    
    -- Se não conseguir obter usuário, usar um UUID padrão
    IF user_id_var IS NULL THEN
      user_id_var := '00000000-0000-0000-0000-000000000000';
    END IF;
    
    -- Criar ordem de manutenção
    INSERT INTO maintenance_orders (
      area_id, 
      title, 
      description, 
      priority, 
      status, 
      requested_by,
      notes,
      order_number
    ) VALUES (
      area_id_var,
      'Manutenção de ' || NEW.name,
      COALESCE(NEW.block_note, 'Acomodação bloqueada para manutenção'),
      'medium',
      'pending',
      user_id_var,
      'Ordem criada automaticamente pelo bloqueio da acomodação',
      'TEMP'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix update_accommodation_on_maintenance_status function
CREATE OR REPLACE FUNCTION public.update_accommodation_on_maintenance_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  accommodation_id_var UUID;
BEGIN
  -- Buscar a acomodação relacionada à área
  SELECT accommodation_id INTO accommodation_id_var 
  FROM areas 
  WHERE id = NEW.area_id AND area_type = 'accommodation';
  
  IF accommodation_id_var IS NOT NULL THEN
    -- Se ordem foi concluída, desbloquear acomodação
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
      UPDATE accommodations 
      SET is_blocked = false, 
          block_reason = NULL, 
          block_note = NULL,
          block_period = NULL
      WHERE id = accommodation_id_var;
    
    -- Se ordem foi cancelada, desbloquear acomodação
    ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
      UPDATE accommodations 
      SET is_blocked = false, 
          block_reason = NULL, 
          block_note = NULL,
          block_period = NULL
      WHERE id = accommodation_id_var;
    
    -- Se ordem está em progresso, manter bloqueada
    ELSIF NEW.status = 'in_progress' AND OLD.status != 'in_progress' THEN
      UPDATE accommodations 
      SET is_blocked = true, 
          block_reason = 'maintenance',
          block_note = 'Em manutenção - Ordem: ' || NEW.order_number
      WHERE id = accommodation_id_var;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;