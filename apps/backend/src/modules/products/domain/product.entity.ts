export interface ProductEntity {
  id: number;
  title: string;
  price: number;
  description: string | null;
  category: string;
  images: string[];
  created_at: string;
  created_by: string;
  created_by_id: string;
  updated_at: string;
  updated_by: string;
  updated_by_id: string;
}
