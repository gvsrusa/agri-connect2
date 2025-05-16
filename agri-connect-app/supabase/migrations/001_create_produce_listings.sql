-- Phase 2: Marketplace Core Functionality
-- Task 2.1: produce_listings Table Schema & RLS

-- Create the produce_listings table
CREATE TABLE public.produce_listings (
    listing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    crop_type TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'available' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add comments to the table and columns for clarity
COMMENT ON TABLE public.produce_listings IS 'Stores listings of produce offered by sellers in the marketplace.';
COMMENT ON COLUMN public.produce_listings.listing_id IS 'Unique identifier for the produce listing.';
COMMENT ON COLUMN public.produce_listings.seller_user_id IS 'Identifier of the user (seller) who created the listing, references auth.users.';
COMMENT ON COLUMN public.produce_listings.crop_type IS 'Type of crop being listed (e.g., "Tomatoes", "Wheat").';
COMMENT ON COLUMN public.produce_listings.quantity IS 'Quantity of the crop available (e.g., in kg, quintals). Unit handling to be defined by application logic or an additional column if varied.';
COMMENT ON COLUMN public.produce_listings.price IS 'Price for the listed quantity of the crop.';
COMMENT ON COLUMN public.produce_listings.description IS 'Optional detailed description of the produce.';
COMMENT ON COLUMN public.produce_listings.status IS 'Current status of the listing (e.g., "available", "sold", "delisted").';
COMMENT ON COLUMN public.produce_listings.created_at IS 'Timestamp of when the listing was created.';
COMMENT ON COLUMN public.produce_listings.updated_at IS 'Timestamp of when the listing was last updated.';

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row modification
CREATE TRIGGER handle_produce_listings_update
BEFORE UPDATE ON public.produce_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS) for the produce_listings table
ALTER TABLE public.produce_listings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for produce_listings

-- 1. Allow public read access for all listings
CREATE POLICY "Allow public read access to produce_listings"
ON public.produce_listings
FOR SELECT
USING (true);

-- 2. Allow authenticated users to insert their own listings
CREATE POLICY "Allow authenticated users to insert their own listings"
ON public.produce_listings
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND seller_user_id = auth.uid());

-- 3. Allow authenticated users to update their own listings
CREATE POLICY "Allow authenticated users to update their own listings"
ON public.produce_listings
FOR UPDATE
USING (auth.role() = 'authenticated' AND seller_user_id = auth.uid())
WITH CHECK (auth.role() = 'authenticated' AND seller_user_id = auth.uid());

-- 4. Allow authenticated users to delete their own listings
CREATE POLICY "Allow authenticated users to delete their own listings"
ON public.produce_listings
FOR DELETE
USING (auth.role() = 'authenticated' AND seller_user_id = auth.uid());