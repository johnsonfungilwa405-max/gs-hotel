-- GS Hotel database schema
-- Shared by User, Admin, and Controller frontends

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers: every customer gets an ID. Account creation (email/google/phone)
-- is optional per the brief; a guest can browse with just an auto-issued ID,
-- but ordering a room requires at least a phone number.
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_code VARCHAR(20) UNIQUE NOT NULL, -- human-friendly ID shown to the guest, e.g. GS-0001
  full_name VARCHAR(150),
  phone_number VARCHAR(30) NOT NULL,
  email VARCHAR(150),
  password_hash VARCHAR(255), -- null until/unless they create an account
  has_account BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rooms: price + photos + status, exactly as sketched (free / ordered / paid)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number VARCHAR(20) UNIQUE NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  pending_price NUMERIC(12, 2), -- set by admin, awaiting controller approval
  status VARCHAR(20) NOT NULL DEFAULT 'free', -- free | ordered | paid
  photo_urls TEXT[] DEFAULT '{}', -- multiple photos for the auto-changing carousel
  description TEXT,
  likes_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT TRUE, -- new rooms need controller approval before going live
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Services: Rooms / Drinks / Food, each service item shows price, order now, like
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(20) NOT NULL, -- room | drink | food
  name VARCHAR(150) NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  pending_price NUMERIC(12, 2),
  photo_url TEXT,
  description TEXT,
  likes_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders: covers both immediate room orders and pre-orders for a room
-- someone else is currently using, with stay duration.
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  order_type VARCHAR(20) NOT NULL DEFAULT 'now', -- now | pre_order
  stay_duration_nights INTEGER NOT NULL DEFAULT 1,
  check_in_date DATE,
  total_price NUMERIC(12, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ordered', -- ordered | paid | cancelled | completed
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Service orders (drinks/food) attached optionally to a room order
CREATE TABLE IF NOT EXISTS service_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price NUMERIC(12, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ordered',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Feedback, reviewed/responded to by the admin
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  admin_response TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Site traffic log: controller needs to see workers/customers entering & leaving
CREATE TABLE IF NOT EXISTS site_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_type VARCHAR(20) NOT NULL, -- customer | worker
  event_type VARCHAR(20) NOT NULL, -- enter | exit
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- News & updates posts shown on the user-facing News tab
CREATE TABLE IF NOT EXISTS news_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pending changes the Admin proposes (price changes, new rooms) that the
-- Controller must approve before they take effect, per the brief's note:
-- "Admin is the regulator of everything but can't change price of rooms
-- or add a room without the controller to approve."
CREATE TABLE IF NOT EXISTS approval_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_type VARCHAR(30) NOT NULL, -- price_change | new_room | new_service
  target_table VARCHAR(20) NOT NULL, -- rooms | services
  target_id UUID, -- null when it's a brand-new room/service awaiting approval
  payload JSONB NOT NULL, -- the proposed data (price, room details, etc.)
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  requested_by VARCHAR(20) DEFAULT 'admin',
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_room ON orders(room_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_service ON service_orders(service_id);
CREATE INDEX IF NOT EXISTS idx_approval_status ON approval_requests(status);

-- Staff accounts: logins for the Admin and Controller dashboards.
-- Only the controller role can create new admin accounts (enforced in
-- the route layer, not the database). The very first controller account
-- is created once via the seed script / a one-time setup route.
CREATE TABLE IF NOT EXISTS staff_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL, -- admin | controller
  full_name VARCHAR(150),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Password reset codes for staff accounts. A short-lived code is issued
-- and must be supplied along with the new password to complete a reset.
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_account_id UUID REFERENCES staff_accounts(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_role ON staff_accounts(role);
CREATE INDEX IF NOT EXISTS idx_password_resets_account ON password_resets(staff_account_id);
