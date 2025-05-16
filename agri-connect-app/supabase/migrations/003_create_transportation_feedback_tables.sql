-- Create transport_requests table
CREATE TABLE IF NOT EXISTS public.transport_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_user_id UUID REFERENCES public.users(id),
    produce_type TEXT NOT NULL,
    quantity TEXT NOT NULL,
    pickup_location TEXT NOT NULL,
    destination_location TEXT NOT NULL,
    date_needed DATE NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create transporters table
CREATE TABLE IF NOT EXISTS public.transporters (
    transporter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_info TEXT,
    service_areas TEXT,
    capacity TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_feedback table
CREATE TABLE IF NOT EXISTS public.user_feedback (
    feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    rating INTEGER,
    comments TEXT NOT NULL,
    page_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for transport_requests table
ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;

-- Farmers can create transport requests
CREATE POLICY "Farmers can create transport requests"
ON public.transport_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = farmer_user_id);

-- Logged-in users can view all transport requests
CREATE POLICY "Logged-in users can view all transport requests"
ON public.transport_requests
FOR SELECT
TO authenticated
USING (true);

-- Farmers can update their own pending requests
CREATE POLICY "Farmers can update their own pending requests"
ON public.transport_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = farmer_user_id AND status = 'pending')
WITH CHECK (auth.uid() = farmer_user_id AND status = 'pending');

-- Farmers can delete their own pending requests
CREATE POLICY "Farmers can delete their own pending requests"
ON public.transport_requests
FOR DELETE
TO authenticated
USING (auth.uid() = farmer_user_id AND status = 'pending');

-- Add RLS policies for transporters table
ALTER TABLE public.transporters ENABLE ROW LEVEL SECURITY;

-- Public read access for browsing transporters
CREATE POLICY "Public read access for transporters"
ON public.transporters
FOR SELECT
TO anon, authenticated
USING (true);

-- Admin role for create/update/delete transporters (assuming admin role exists)
CREATE POLICY "Admin can manage transporters"
ON public.transporters
FOR ALL
TO authenticated
USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin')
WITH CHECK (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

-- Add RLS policies for user_feedback table
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Logged-in users can insert their own feedback
CREATE POLICY "Logged-in users can insert their own feedback"
ON public.user_feedback
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Anonymous users can insert feedback (if user_id is null)
CREATE POLICY "Anonymous users can insert feedback"
ON public.user_feedback
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Admin role for read access to feedback
CREATE POLICY "Admin can read all feedback"
ON public.user_feedback
FOR SELECT
TO authenticated
USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

-- Seed data for transporters
INSERT INTO public.transporters (name, contact_info, service_areas, capacity)
VALUES 
    ('Singh Logistics', 'Phone: +91 9876543210, Email: contact@singhlogistics.com', 'Delhi, Haryana, Punjab', 'Medium trucks: 1-5 tons capacity'),
    ('Patel Transport Services', 'Phone: +91 8765432109, Email: info@pateltransport.com', 'Maharashtra, Gujarat, Rajasthan', 'Small to large vehicles: 500kg - 10 tons'),
    ('Eastern Carriers', 'Phone: +91 7654321098, Email: support@easterncarriers.com', 'West Bengal, Bihar, Jharkhand, Odisha', 'Various capacities available: 1-8 tons');