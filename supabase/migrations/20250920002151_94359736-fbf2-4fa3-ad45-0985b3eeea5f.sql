-- Update reservation_status enum to include checked_in and checked_out
ALTER TYPE reservation_status ADD VALUE IF NOT EXISTS 'checked_in';
ALTER TYPE reservation_status ADD VALUE IF NOT EXISTS 'checked_out';

-- Update payment_method enum to include all payment methods
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'debit_card';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'cash';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'transfer';