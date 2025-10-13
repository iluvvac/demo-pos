insert into public.price_index (product_type, size, material, unit_price, finishing_price) values
('print-digital','A4','HVS 80gsm',500,0),
('print-digital','A3','HVS 80gsm',1000,0),
('sticker','A4','Vinyl',3000,500),
('spanduk','Custom','Flexi 260',20000,5000)
on conflict (product_type, size, material) do nothing;
