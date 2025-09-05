
-- Ajuste de períodos para Dezembro/2025 conforme regra de negócio (3+3+4)
-- Observação: usamos condições adicionais no WHERE para evitar alterar outros anos.

-- 1) Ajustar fim do período "Natal" para 2025-12-25 (última diária 25→26).
UPDATE price_periods
SET end_date = '2025-12-25'
WHERE name = 'Natal'
  AND start_date = '2025-12-23'
  AND end_date = '2025-12-26';

-- 2) Ajustar início do período "Réveillon" para 2025-12-26 (primeira diária 26→27).
UPDATE price_periods
SET start_date = '2025-12-26'
WHERE name = 'Réveillon'
  AND start_date = '2025-12-27'
  AND end_date = '2026-01-02';

-- Verificações (opcional): listar os períodos após ajustes
-- SELECT id, name, start_date, end_date FROM price_periods
-- WHERE (name IN ('Natal', 'Réveillon')) AND (start_date BETWEEN '2025-12-01' AND '2026-01-10')
-- ORDER BY start_date;
