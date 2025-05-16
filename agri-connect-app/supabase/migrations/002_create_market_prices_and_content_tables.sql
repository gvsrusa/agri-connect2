-- Phase 3: Market Prices & Advisory Content
-- Task 3.1 & 3.3: Data Management for market_prices, advisory_content, and post_harvest_content

-- Create market_prices table
CREATE TABLE public.market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name_key TEXT NOT NULL,
    market_name_key TEXT NOT NULL,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    unit_key TEXT NOT NULL,
    price_date DATE NOT NULL,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add comments to the market_prices table
COMMENT ON TABLE public.market_prices IS 'Stores market prices for various crops at different market locations.';
COMMENT ON COLUMN public.market_prices.id IS 'Unique identifier for the market price entry.';
COMMENT ON COLUMN public.market_prices.crop_name_key IS 'Translation key for the crop name (e.g., "wheat", "rice").';
COMMENT ON COLUMN public.market_prices.market_name_key IS 'Translation key for the market location (e.g., "delhi_azadpur_mandi").';
COMMENT ON COLUMN public.market_prices.price IS 'Price value for the crop at this market.';
COMMENT ON COLUMN public.market_prices.currency IS 'Currency code for the price (e.g., "INR").';
COMMENT ON COLUMN public.market_prices.unit_key IS 'Translation key for the unit of measurement (e.g., "quintal", "kg").';
COMMENT ON COLUMN public.market_prices.price_date IS 'Date for which the price is valid.';
COMMENT ON COLUMN public.market_prices.source IS 'Optional source of the price data (e.g., "mandi_board_api", "manual_entry").';
COMMENT ON COLUMN public.market_prices.created_at IS 'Timestamp of when the record was created.';
COMMENT ON COLUMN public.market_prices.updated_at IS 'Timestamp of when the record was last updated.';

-- Create advisory_content table
CREATE TABLE public.advisory_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_key TEXT NOT NULL,
    language_code TEXT NOT NULL REFERENCES public.languages(code),
    title TEXT NOT NULL,
    body_text TEXT NOT NULL,
    category_key TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(topic_key, language_code)
);

-- Add comments to the advisory_content table
COMMENT ON TABLE public.advisory_content IS 'Stores multilingual crop advisory content.';
COMMENT ON COLUMN public.advisory_content.id IS 'Unique identifier for the advisory content entry.';
COMMENT ON COLUMN public.advisory_content.topic_key IS 'Unique identifier for a topic (e.g., "cotton_pest_control").';
COMMENT ON COLUMN public.advisory_content.language_code IS 'Language code (references languages table) for this content.';
COMMENT ON COLUMN public.advisory_content.title IS 'Title of the advisory content in the specified language.';
COMMENT ON COLUMN public.advisory_content.body_text IS 'Main content text in the specified language.';
COMMENT ON COLUMN public.advisory_content.category_key IS 'Optional category key for grouping content (e.g., "pest_management").';
COMMENT ON COLUMN public.advisory_content.image_url IS 'Optional URL to an image related to this content.';
COMMENT ON COLUMN public.advisory_content.created_at IS 'Timestamp of when the record was created.';
COMMENT ON COLUMN public.advisory_content.updated_at IS 'Timestamp of when the record was last updated.';

-- Create post_harvest_content table
CREATE TABLE public.post_harvest_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_key TEXT NOT NULL,
    language_code TEXT NOT NULL REFERENCES public.languages(code),
    title TEXT NOT NULL,
    body_text TEXT NOT NULL,
    category_key TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(topic_key, language_code)
);

-- Add comments to the post_harvest_content table
COMMENT ON TABLE public.post_harvest_content IS 'Stores multilingual post-harvest guidance content.';
COMMENT ON COLUMN public.post_harvest_content.id IS 'Unique identifier for the post-harvest content entry.';
COMMENT ON COLUMN public.post_harvest_content.topic_key IS 'Unique identifier for a topic (e.g., "wheat_storage_tips").';
COMMENT ON COLUMN public.post_harvest_content.language_code IS 'Language code (references languages table) for this content.';
COMMENT ON COLUMN public.post_harvest_content.title IS 'Title of the post-harvest content in the specified language.';
COMMENT ON COLUMN public.post_harvest_content.body_text IS 'Main content text in the specified language.';
COMMENT ON COLUMN public.post_harvest_content.category_key IS 'Optional category key for grouping content (e.g., "storage").';
COMMENT ON COLUMN public.post_harvest_content.image_url IS 'Optional URL to an image related to this content.';
COMMENT ON COLUMN public.post_harvest_content.created_at IS 'Timestamp of when the record was created.';
COMMENT ON COLUMN public.post_harvest_content.updated_at IS 'Timestamp of when the record was last updated.';

-- Create triggers to automatically update updated_at on row modification
CREATE TRIGGER handle_market_prices_update
BEFORE UPDATE ON public.market_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER handle_advisory_content_update
BEFORE UPDATE ON public.advisory_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER handle_post_harvest_content_update
BEFORE UPDATE ON public.post_harvest_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisory_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_harvest_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to allow public read access for the tables
CREATE POLICY "Allow public read access to market_prices"
ON public.market_prices
FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to advisory_content"
ON public.advisory_content
FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to post_harvest_content"
ON public.post_harvest_content
FOR SELECT
USING (true);

-- Seed data for market_prices
INSERT INTO public.market_prices (crop_name_key, market_name_key, price, currency, unit_key, price_date, source)
VALUES 
  ('wheat', 'delhi_azadpur_mandi', 1950.00, 'INR', 'quintal', CURRENT_DATE, 'manual_entry'),
  ('wheat', 'mumbai_vashi_market', 2050.00, 'INR', 'quintal', CURRENT_DATE, 'manual_entry'),
  ('rice', 'delhi_azadpur_mandi', 2850.00, 'INR', 'quintal', CURRENT_DATE, 'manual_entry'),
  ('rice', 'mumbai_vashi_market', 3000.00, 'INR', 'quintal', CURRENT_DATE, 'manual_entry'),
  ('cotton', 'gujarat_rajkot_market', 6500.00, 'INR', 'quintal', CURRENT_DATE, 'manual_entry');

-- Seed data for advisory_content
INSERT INTO public.advisory_content (topic_key, language_code, title, body_text, category_key, image_url)
VALUES
  -- Cotton pest management in English
  ('cotton_pest_management', 'en', 'Cotton Pest Management', 'Cotton is susceptible to various pests including bollworms, aphids, and whiteflies. Regular monitoring is essential. Use integrated pest management techniques including crop rotation, natural predators, and targeted pesticide application only when necessary. Early detection can prevent major infestations and crop loss.', 'pest_management', 'https://example.com/images/cotton_pest.jpg'),
  
  -- Cotton pest management in Hindi
  ('cotton_pest_management', 'hi', 'कपास कीट प्रबंधन', 'कपास विभिन्न कीटों के लिए संवेदनशील है, जिसमें बॉलवर्म, एफिड्स और सफेद मक्खियां शामिल हैं। नियमित निगरानी आवश्यक है। एकीकृत कीट प्रबंधन तकनीकों का उपयोग करें, जिसमें फसल चक्र, प्राकृतिक शिकारियों और केवल आवश्यकता होने पर लक्षित कीटनाशक अनुप्रयोग शामिल हैं। शीघ्र पता लगाने से प्रमुख संक्रमण और फसल हानि को रोका जा सकता है।', 'pest_management', 'https://example.com/images/cotton_pest.jpg'),
  
  -- Cotton pest management in Marathi
  ('cotton_pest_management', 'mr', 'कापूस कीटक व्यवस्थापन', 'कापूस विविध कीटकांसाठी संवेदनशील आहे ज्यामध्ये बोलवर्म, एफिड आणि पांढऱ्या माशा समाविष्ट आहेत. नियमित देखरेख आवश्यक आहे. एकात्मिक कीटक व्यवस्थापन तंत्रांचा वापर करा ज्यामध्ये पिक फिरवणे, नैसर्गिक परभक्षी आणि फक्त आवश्यक असेल तेव्हाच लक्ष्यित कीटकनाशक वापरणे समाविष्ट आहे. लवकर शोध घेतल्याने मोठ्या प्रमाणात संसर्ग आणि पिकांची हानी टाळता येते.', 'pest_management', 'https://example.com/images/cotton_pest.jpg'),
  
  -- Soil health management in English
  ('soil_health_management', 'en', 'Soil Health Management', 'Maintaining soil health is crucial for sustainable agriculture. Regular soil testing helps monitor nutrient levels and pH. Use organic matter like compost and manure to improve soil structure and fertility. Practice crop rotation to prevent nutrient depletion, and consider cover crops during off-seasons to prevent soil erosion and add organic matter.', 'soil_health', 'https://example.com/images/soil_health.jpg'),
  
  -- Soil health management in Hindi
  ('soil_health_management', 'hi', 'मिट्टी स्वास्थ्य प्रबंधन', 'टिकाऊ कृषि के लिए मिट्टी के स्वास्थ्य को बनाए रखना महत्वपूर्ण है। नियमित मिट्टी परीक्षण पोषक तत्वों के स्तर और पीएच की निगरानी में मदद करता है। मिट्टी की संरचना और उर्वरता में सुधार के लिए खाद और गोबर जैसे कार्बनिक पदार्थों का उपयोग करें। पोषक तत्वों की कमी को रोकने के लिए फसल चक्र का अभ्यास करें, और मिट्टी के कटाव को रोकने और कार्बनिक पदार्थ जोड़ने के लिए ऑफ-सीजन के दौरान कवर फसलों पर विचार करें।', 'soil_health', 'https://example.com/images/soil_health.jpg'),
  
  -- Soil health management in Marathi
  ('soil_health_management', 'mr', 'माती आरोग्य व्यवस्थापन', 'शाश्वत शेतीसाठी मातीचे आरोग्य टिकवून ठेवणे अत्यंत महत्त्वाचे आहे. नियमित माती चाचणी पोषक पातळी आणि पीएच निरीक्षण करण्यास मदत करते. मातीची संरचना आणि सुपीकता सुधारण्यासाठी कंपोस्ट आणि शेणखत यासारख्या सेंद्रिय पदार्थांचा वापर करा. पोषक तत्त्वांची कमतरता टाळण्यासाठी पीक फिरवणे अभ्यास करा, आणि मातीची धूप रोखण्यासाठी आणि सेंद्रिय पदार्थ जोडण्यासाठी हंगामाबाहेरील हंगामात कव्हर पिके विचारात घ्या.', 'soil_health', 'https://example.com/images/soil_health.jpg');

-- Seed data for post_harvest_content
INSERT INTO public.post_harvest_content (topic_key, language_code, title, body_text, category_key, image_url)
VALUES
  -- Wheat storage tips in English
  ('wheat_storage_tips', 'en', 'Wheat Storage Tips', 'Proper wheat storage begins with harvest at the right moisture content (around 12-14%). Clean the grain thoroughly to remove debris and foreign material. Store in clean, dry, and well-ventilated facilities. Regularly monitor temperature and moisture to prevent mold growth. Use appropriate pest control measures to prevent insect infestations. For long-term storage, consider hermetic storage solutions that limit oxygen levels.', 'storage', 'https://example.com/images/wheat_storage.jpg'),
  
  -- Wheat storage tips in Hindi
  ('wheat_storage_tips', 'hi', 'गेहूं भंडारण युक्तियाँ', 'उचित गेहूं भंडारण सही नमी सामग्री (लगभग 12-14%) पर कटाई के साथ शुरू होता है। मलबे और विदेशी सामग्री को हटाने के लिए अनाज को अच्छी तरह से साफ करें। साफ, सूखी और अच्छी वेंटिलेशन वाली सुविधाओं में स्टोर करें। फफूंदी की वृद्धि को रोकने के लिए नियमित रूप से तापमान और नमी की निगरानी करें। कीट संक्रमण को रोकने के लिए उपयुक्त कीट नियंत्रण उपायों का उपयोग करें। लंबे समय तक भंडारण के लिए, हर्मेटिक भंडारण समाधानों पर विचार करें जो ऑक्सीजन के स्तर को सीमित करते हैं।', 'storage', 'https://example.com/images/wheat_storage.jpg'),
  
  -- Wheat storage tips in Marathi
  ('wheat_storage_tips', 'mr', 'गहू साठवणूक टिप्स', 'योग्य गहू साठवण योग्य ओलावा सामग्री (सुमारे 12-14%) वर कापणी सुरू होते. डेब्रिस आणि परकीय सामग्री काढून टाकण्यासाठी धान्य पूर्णपणे स्वच्छ करा. स्वच्छ, कोरड्या आणि चांगल्या वायुवीजन असलेल्या सुविधांमध्ये साठवा. बुरशी वाढ रोखण्यासाठी नियमितपणे तापमान आणि ओलावा निरीक्षण करा. कीटक संक्रमण रोखण्यासाठी योग्य कीटक नियंत्रण उपायांचा वापर करा. दीर्घकालीन साठवणुकीसाठी, ऑक्सिजन पातळी मर्यादित करणार्‍या हर्मेटिक स्टोरेज सोल्यूशन्सचा विचार करा.', 'storage', 'https://example.com/images/wheat_storage.jpg'),
  
  -- Rice processing techniques in English
  ('rice_processing_techniques', 'en', 'Rice Processing Techniques', 'Post-harvest rice processing includes several steps: threshing to separate grains from stalks, cleaning to remove impurities, parboiling (optional) for nutritional benefits, drying to optimal moisture content, dehusking to remove the outer husk, milling to remove the bran layer, and grading for quality. Each step significantly affects the final quality and market value of the rice. Modern milling techniques can reduce breakage and increase yield.', 'processing', 'https://example.com/images/rice_processing.jpg'),
  
  -- Rice processing techniques in Hindi
  ('rice_processing_techniques', 'hi', 'चावल प्रसंस्करण तकनीक', 'कटाई के बाद चावल प्रसंस्करण में कई चरण शामिल हैं: तने से अनाज को अलग करने के लिए थ्रेशिंग, अशुद्धियों को हटाने के लिए सफाई, पोषण संबंधी लाभों के लिए पारबॉइलिंग (वैकल्पिक), इष्टतम नमी सामग्री के लिए सुखाना, बाहरी छिलका हटाने के लिए डिहस्किंग, चोकर परत हटाने के लिए मिलिंग, और गुणवत्ता के लिए ग्रेडिंग। प्रत्येक चरण चावल की अंतिम गुणवत्ता और बाजार मूल्य को महत्वपूर्ण रूप से प्रभावित करता है। आधुनिक मिलिंग तकनीकें टूटने को कम कर सकती हैं और उपज बढ़ा सकती हैं।', 'processing', 'https://example.com/images/rice_processing.jpg'),
  
  -- Rice processing techniques in Marathi
  ('rice_processing_techniques', 'mr', 'तांदूळ प्रक्रिया तंत्रे', 'कापणीनंतरच्या तांदळाच्या प्रक्रियेमध्ये अनेक टप्पे समाविष्ट आहेत: स्टेम्सपासून धान्य वेगळे करण्यासाठी थ्रेशिंग, अशुद्धता काढून टाकण्यासाठी सफाई, पौष्टिक फायद्यांसाठी पारबॉइलिंग (पर्यायी), इष्ट ओलावा सामग्रीसाठी वाळवणे, बाहेरील कवच काढून टाकण्यासाठी डीहुस्किंग, कोंडा लेयर काढून टाकण्यासाठी मिलिंग आणि गुणवत्तेसाठी ग्रेडिंग. प्रत्येक टप्पा तांदळाच्या अंतिम गुणवत्तेवर आणि बाजार मूल्यावर लक्षणीय परिणाम करतो. आधुनिक मिलिंग तंत्रे तुटणे कमी करू शकतात आणि उत्पादन वाढू शकतात.', 'processing', 'https://example.com/images/rice_processing.jpg');