/**
 * Supabase Database Types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          nickname: string | null;
          display_name: string | null;
          avatar_url: string | null;
          role: 'customer' | 'admin';
          grade: 'bronze' | 'silver' | 'gold' | 'vip';
          points: number;
          total_order_amount: number;
          is_blocked: boolean;
          blocked_reason: string | null;
          blocked_at: string | null;
          last_login_at: string | null;
          // Roomy 전용 필드
          plan: 'free' | 'pro' | 'business';
          guidebook_count: number;
          max_guidebooks: number;
          ai_generation_count: number;
          max_ai_generations: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nickname?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'admin';
          grade?: 'bronze' | 'silver' | 'gold' | 'vip';
          points?: number;
          total_order_amount?: number;
          is_blocked?: boolean;
          blocked_reason?: string | null;
          blocked_at?: string | null;
          last_login_at?: string | null;
          // Roomy 전용 필드
          plan?: 'free' | 'pro' | 'business';
          guidebook_count?: number;
          max_guidebooks?: number;
          ai_generation_count?: number;
          max_ai_generations?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nickname?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'admin';
          grade?: 'bronze' | 'silver' | 'gold' | 'vip';
          points?: number;
          total_order_amount?: number;
          is_blocked?: boolean;
          blocked_reason?: string | null;
          blocked_at?: string | null;
          last_login_at?: string | null;
          // Roomy 전용 필드
          plan?: 'free' | 'pro' | 'business';
          guidebook_count?: number;
          max_guidebooks?: number;
          ai_generation_count?: number;
          max_ai_generations?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          parent_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          price: number;
          discount_price: number | null;
          metadata: Json;
          status: 'draft' | 'active' | 'archived' | 'hidden';
          is_featured: boolean;
          view_count: number;
          sales_count: number;
          stock: number;
          stock_alert_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          short_description?: string | null;
          description?: string | null;
          price: number;
          discount_price?: number | null;
          metadata?: Json;
          status?: 'draft' | 'active' | 'archived' | 'hidden';
          is_featured?: boolean;
          view_count?: number;
          sales_count?: number;
          stock?: number;
          stock_alert_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          short_description?: string | null;
          description?: string | null;
          price?: number;
          discount_price?: number | null;
          metadata?: Json;
          status?: 'draft' | 'active' | 'archived' | 'hidden';
          is_featured?: boolean;
          view_count?: number;
          sales_count?: number;
          stock?: number;
          stock_alert_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          url?: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      product_files: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          version: string;
          download_limit: number;
          is_preview: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          file_path: string;
          file_size?: number;
          file_type?: string;
          version?: string;
          download_limit?: number;
          is_preview?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          file_path?: string;
          file_size?: number;
          file_type?: string;
          version?: string;
          download_limit?: number;
          is_preview?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      product_tags: {
        Row: {
          product_id: string;
          tag_id: string;
        };
        Insert: {
          product_id: string;
          tag_id: string;
        };
        Update: {
          product_id?: string;
          tag_id?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          product_id: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          product_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          guest_email: string | null;
          status: 'pending' | 'paid' | 'completed' | 'cancelled' | 'refunded';
          total_amount: number;
          discount_amount: number;
          payment_info: Json;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id?: string | null;
          guest_email?: string | null;
          status?: 'pending' | 'paid' | 'completed' | 'cancelled' | 'refunded';
          total_amount: number;
          discount_amount?: number;
          payment_info?: Json;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          guest_email?: string | null;
          status?: 'pending' | 'paid' | 'completed' | 'cancelled' | 'refunded';
          total_amount?: number;
          discount_amount?: number;
          payment_info?: Json;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          price: number;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          price: number;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          price?: number;
          quantity?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      downloads: {
        Row: {
          id: string;
          order_item_id: string;
          product_file_id: string;
          download_count: number;
          max_downloads: number;
          expires_at: string;
          last_downloaded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_item_id: string;
          product_file_id: string;
          download_count?: number;
          max_downloads?: number;
          expires_at: string;
          last_downloaded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_item_id?: string;
          product_file_id?: string;
          download_count?: number;
          max_downloads?: number;
          expires_at?: string;
          last_downloaded_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          order_item_id: string;
          rating: number;
          title: string;
          content: string;
          images: Json | null;
          like_count: number;
          view_count: number;
          is_best: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          order_item_id: string;
          rating: number;
          title: string;
          content: string;
          images?: Json | null;
          like_count?: number;
          view_count?: number;
          is_best?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string;
          order_item_id?: string;
          rating?: number;
          title?: string;
          content?: string;
          images?: Json | null;
          like_count?: number;
          view_count?: number;
          is_best?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          product_id: string | null;
          user_id: string;
          category: string;
          title: string;
          content: string;
          is_private: boolean;
          status: 'pending' | 'answered';
          answer: string | null;
          answered_at: string | null;
          answered_by: string | null;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          user_id: string;
          category: string;
          title: string;
          content: string;
          is_private?: boolean;
          status?: 'pending' | 'answered';
          answer?: string | null;
          answered_at?: string | null;
          answered_by?: string | null;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          user_id?: string;
          category?: string;
          title?: string;
          content?: string;
          is_private?: boolean;
          status?: 'pending' | 'answered';
          answer?: string | null;
          answered_at?: string | null;
          answered_by?: string | null;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          commentable_type: 'review' | 'inquiry';
          commentable_id: string;
          parent_id: string | null;
          user_id: string;
          content: string;
          like_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          commentable_type: 'review' | 'inquiry';
          commentable_id: string;
          parent_id?: string | null;
          user_id: string;
          content: string;
          like_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          commentable_type?: 'review' | 'inquiry';
          commentable_id?: string;
          parent_id?: string | null;
          user_id?: string;
          content?: string;
          like_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      likes: {
        Row: {
          id: string;
          likeable_type: 'review' | 'comment';
          likeable_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          likeable_type: 'review' | 'comment';
          likeable_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          likeable_type?: 'review' | 'comment';
          likeable_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      inventory_logs: {
        Row: {
          id: string;
          product_id: string;
          type: 'in' | 'out' | 'adjust';
          quantity: number;
          reason: string | null;
          reference_id: string | null;
          reference_type: string | null;
          stock_before: number;
          stock_after: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          type: 'in' | 'out' | 'adjust';
          quantity: number;
          reason?: string | null;
          reference_id?: string | null;
          reference_type?: string | null;
          stock_before: number;
          stock_after: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          type?: 'in' | 'out' | 'adjust';
          quantity?: number;
          reason?: string | null;
          reference_id?: string | null;
          reference_type?: string | null;
          stock_before?: number;
          stock_after?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          name: string;
          type: 'percent' | 'fixed' | 'free_shipping';
          value: number;
          min_order_amount: number;
          max_discount: number | null;
          start_at: string;
          end_at: string;
          usage_limit: number | null;
          usage_limit_per_user: number;
          used_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          type: 'percent' | 'fixed' | 'free_shipping';
          value: number;
          min_order_amount?: number;
          max_discount?: number | null;
          start_at: string;
          end_at: string;
          usage_limit?: number | null;
          usage_limit_per_user?: number;
          used_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          type?: 'percent' | 'fixed' | 'free_shipping';
          value?: number;
          min_order_amount?: number;
          max_discount?: number | null;
          start_at?: string;
          end_at?: string;
          usage_limit?: number | null;
          usage_limit_per_user?: number;
          used_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      coupon_usages: {
        Row: {
          id: string;
          coupon_id: string;
          user_id: string;
          order_id: string;
          discount_amount: number;
          used_at: string;
        };
        Insert: {
          id?: string;
          coupon_id: string;
          user_id: string;
          order_id: string;
          discount_amount: number;
          used_at?: string;
        };
        Update: {
          id?: string;
          coupon_id?: string;
          user_id?: string;
          order_id?: string;
          discount_amount?: number;
          used_at?: string;
        };
        Relationships: [];
      };
      user_coupons: {
        Row: {
          id: string;
          user_id: string;
          coupon_id: string;
          issued_at: string;
          expires_at: string;
          is_used: boolean;
          used_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          coupon_id: string;
          issued_at?: string;
          expires_at: string;
          is_used?: boolean;
          used_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          coupon_id?: string;
          issued_at?: string;
          expires_at?: string;
          is_used?: boolean;
          used_at?: string | null;
        };
        Relationships: [];
      };
      user_grades: {
        Row: {
          id: number;
          code: 'bronze' | 'silver' | 'gold' | 'vip';
          name: string;
          min_order_amount: number;
          discount_rate: number;
          point_rate: number;
          description: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          code: 'bronze' | 'silver' | 'gold' | 'vip';
          name: string;
          min_order_amount?: number;
          discount_rate?: number;
          point_rate?: number;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          code?: 'bronze' | 'silver' | 'gold' | 'vip';
          name?: string;
          min_order_amount?: number;
          discount_rate?: number;
          point_rate?: number;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      grade_histories: {
        Row: {
          id: number;
          user_id: string;
          from_grade: string | null;
          to_grade: string;
          reason: string;
          changed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          from_grade?: string | null;
          to_grade: string;
          reason?: string;
          changed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          from_grade?: string | null;
          to_grade?: string;
          reason?: string;
          changed_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      point_histories: {
        Row: {
          id: number;
          user_id: string;
          type: 'earn' | 'use' | 'expire' | 'adjust' | 'refund';
          amount: number;
          balance: number;
          reason: string;
          reference_type: string | null;
          reference_id: string | null;
          expires_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          type: 'earn' | 'use' | 'expire' | 'adjust' | 'refund';
          amount: number;
          balance: number;
          reason: string;
          reference_type?: string | null;
          reference_id?: string | null;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          type?: 'earn' | 'use' | 'expire' | 'adjust' | 'refund';
          amount?: number;
          balance?: number;
          reason?: string;
          reference_type?: string | null;
          reference_id?: string | null;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      // @TASK P2-T2.7 - 조회 통계 테이블
      guidebook_views: {
        Row: {
          id: string;
          guidebook_id: string;
          visitor_id: string | null;
          ip_hash: string | null;
          user_agent: string | null;
          referrer: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          guidebook_id: string;
          visitor_id?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          guidebook_id?: string;
          visitor_id?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          viewed_at?: string;
        };
        Relationships: [];
      };
      // @TASK P0-T0.4 - 가이드북 테이블
      guidebooks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          slug: string;
          description: string | null;
          airbnb_url: string | null;
          property_type: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          status: 'draft' | 'published' | 'archived';
          is_password_protected: boolean;
          password_hash: string | null;
          theme: 'modern' | 'cozy' | 'minimal' | 'nature' | 'luxury';
          primary_color: string;
          secondary_color: string;
          hero_image_url: string | null;
          og_image_url: string | null;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          slug: string;
          description?: string | null;
          airbnb_url?: string | null;
          property_type?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          status?: 'draft' | 'published' | 'archived';
          is_password_protected?: boolean;
          password_hash?: string | null;
          theme?: 'modern' | 'cozy' | 'minimal' | 'nature' | 'luxury';
          primary_color?: string;
          secondary_color?: string;
          hero_image_url?: string | null;
          og_image_url?: string | null;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          airbnb_url?: string | null;
          property_type?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          status?: 'draft' | 'published' | 'archived';
          is_password_protected?: boolean;
          password_hash?: string | null;
          theme?: 'modern' | 'cozy' | 'minimal' | 'nature' | 'luxury';
          primary_color?: string;
          secondary_color?: string;
          hero_image_url?: string | null;
          og_image_url?: string | null;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      // @TASK P0-T0.4 - 블록 테이블
      blocks: {
        Row: {
          id: string;
          guidebook_id: string;
          type: 'hero' | 'quickInfo' | 'amenities' | 'rules' | 'map' | 'gallery' | 'notice' | 'custom';
          order_index: number;
          content: Json;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guidebook_id: string;
          type: 'hero' | 'quickInfo' | 'amenities' | 'rules' | 'map' | 'gallery' | 'notice' | 'custom';
          order_index?: number;
          content?: Json;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          guidebook_id?: string;
          type?: 'hero' | 'quickInfo' | 'amenities' | 'rules' | 'map' | 'gallery' | 'notice' | 'custom';
          order_index?: number;
          content?: Json;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      // @TASK P0-T0.4 - 블록 이미지 테이블
      block_images: {
        Row: {
          id: string;
          block_id: string;
          storage_path: string;
          file_name: string | null;
          file_size: number | null;
          mime_type: string | null;
          alt_text: string | null;
          caption: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          block_id: string;
          storage_path: string;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          alt_text?: string | null;
          caption?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          block_id?: string;
          storage_path?: string;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          alt_text?: string | null;
          caption?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      // @TASK P3-T3.5 - AI 사용량 추적 테이블
      ai_usage: {
        Row: {
          id: string;
          user_id: string;
          guidebook_id: string | null;
          tokens_used: number;
          model: string;
          action: 'generate' | 'edit' | 'chat';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          guidebook_id?: string | null;
          tokens_used?: number;
          model?: string;
          action: 'generate' | 'edit' | 'chat';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          guidebook_id?: string | null;
          tokens_used?: number;
          model?: string;
          action?: 'generate' | 'edit' | 'chat';
          created_at?: string;
        };
        Relationships: [];
      };
      // @TASK P4-T4.6 - 알림 설정 테이블
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          daily_stats: boolean;
          new_features: boolean;
          marketing: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          daily_stats?: boolean;
          new_features?: boolean;
          marketing?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          daily_stats?: boolean;
          new_features?: boolean;
          marketing?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      // @TASK P6-T6.1 - 플랜 제한 테이블
      plan_limits: {
        Row: {
          id: string;
          plan: 'free' | 'pro' | 'business';
          max_guidebooks: number;
          max_ai_generations: number;
          features: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan: 'free' | 'pro' | 'business';
          max_guidebooks?: number;
          max_ai_generations?: number;
          features?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan?: 'free' | 'pro' | 'business';
          max_guidebooks?: number;
          max_ai_generations?: number;
          features?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      // @TASK P5-T5.3 - 공유 이벤트 테이블
      share_events: {
        Row: {
          id: string;
          guidebook_id: string;
          event_type: 'short_url_click' | 'link_copy' | 'qr_download' | 'social_share';
          event_data: Json | null;
          user_agent: string | null;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          guidebook_id: string;
          event_type: 'short_url_click' | 'link_copy' | 'qr_download' | 'social_share';
          event_data?: Json | null;
          user_agent?: string | null;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          guidebook_id?: string;
          event_type?: 'short_url_click' | 'link_copy' | 'qr_download' | 'social_share';
          event_data?: Json | null;
          user_agent?: string | null;
          ip_hash?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      // @TASK P2-T2.7 - 가이드북 조회 통계 테이블
      guidebook_views: {
        Row: {
          id: string;
          guidebook_id: string;
          visitor_id: string | null;
          ip_hash: string | null;
          user_agent: string | null;
          referrer: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          guidebook_id: string;
          visitor_id?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          guidebook_id?: string;
          visitor_id?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          viewed_at?: string;
        };
        Relationships: [];
      };
      // cleanup용 테이블
      view_logs: {
        Row: {
          id: string;
          guidebook_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          guidebook_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          guidebook_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      ai_usage_logs: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      // @TASK P6-T6.1 - 구독 테이블
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: 'free' | 'pro' | 'business';
          status: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          payment_provider: string | null;
          payment_customer_id: string | null;
          payment_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: 'free' | 'pro' | 'business';
          status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          payment_provider?: string | null;
          payment_customer_id?: string | null;
          payment_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: 'free' | 'pro' | 'business';
          status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          payment_provider?: string | null;
          payment_customer_id?: string | null;
          payment_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      // @TASK P6-T6.1 - 결제 내역 테이블
      payment_history: {
        Row: {
          id: string;
          subscription_id: string | null;
          user_id: string;
          amount: number;
          currency: string;
          status: 'pending' | 'succeeded' | 'failed' | 'refunded';
          payment_method: string | null;
          payment_key: string | null;
          order_id: string | null;
          receipt_url: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscription_id?: string | null;
          user_id: string;
          amount: number;
          currency?: string;
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded';
          payment_method?: string | null;
          payment_key?: string | null;
          order_id?: string | null;
          receipt_url?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string | null;
          user_id?: string;
          amount?: number;
          currency?: string;
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded';
          payment_method?: string | null;
          payment_key?: string | null;
          order_id?: string | null;
          receipt_url?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      // @TASK P6-T6.1 - 플랜 제한 테이블
      plan_limits: {
        Row: {
          plan: 'free' | 'pro' | 'business';
          max_guidebooks: number;
          max_ai_generations_per_month: number;
          watermark_removed: boolean;
          custom_domain: boolean;
          priority_support: boolean;
          price_yearly: number;
          created_at: string;
        };
        Insert: {
          plan: 'free' | 'pro' | 'business';
          max_guidebooks: number;
          max_ai_generations_per_month: number;
          watermark_removed?: boolean;
          custom_domain?: boolean;
          priority_support?: boolean;
          price_yearly: number;
          created_at?: string;
        };
        Update: {
          plan?: 'free' | 'pro' | 'business';
          max_guidebooks?: number;
          max_ai_generations_per_month?: number;
          watermark_removed?: boolean;
          custom_domain?: boolean;
          priority_support?: boolean;
          price_yearly?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      // @TASK P5-T5.4 - 단축 URL 테이블
      short_urls: {
        Row: {
          id: string;
          guidebook_id: string;
          short_code: string;
          expires_at: string | null;
          clicks: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guidebook_id: string;
          short_code: string;
          expires_at?: string | null;
          clicks?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          guidebook_id?: string;
          short_code?: string;
          expires_at?: string | null;
          clicks?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      toggle_like: {
        Args: {
          p_likeable_type: 'review' | 'comment';
          p_likeable_id: string;
          p_user_id: string;
        };
        Returns: {
          action: 'liked' | 'unliked';
          like_id: string;
        };
      };
      check_user_liked: {
        Args: {
          p_likeable_type: 'review' | 'comment';
          p_likeable_id: string;
          p_user_id: string;
        };
        Returns: boolean;
      };
      get_comment_tree: {
        Args: {
          p_commentable_type: 'review' | 'inquiry';
          p_commentable_id: string;
        };
        Returns: {
          id: string;
          parent_id: string | null;
          user_id: string;
          content: string;
          like_count: number;
          created_at: string;
          level: number;
        }[];
      };
      increment_inquiry_view_count: {
        Args: {
          inquiry_id: string;
        };
        Returns: void;
      };
      get_pending_inquiry_count: {
        Args: Record<string, never>;
        Returns: number;
      };
      get_product_inquiry_count: {
        Args: {
          p_product_id: string;
        };
        Returns: number;
      };
      increment_review_view_count: {
        Args: {
          review_id: string;
        };
        Returns: void;
      };
      get_product_average_rating: {
        Args: {
          p_product_id: string;
        };
        Returns: number;
      };
      check_stock_availability: {
        Args: {
          p_product_id: string;
          p_quantity: number;
        };
        Returns: boolean;
      };
      deduct_stock: {
        Args: {
          p_product_id: string;
          p_quantity: number;
          p_reference_id: string;
          p_reference_type?: string;
          p_reason?: string;
        };
        Returns: boolean;
      };
      add_stock: {
        Args: {
          p_product_id: string;
          p_quantity: number;
          p_reference_id?: string;
          p_reference_type?: string;
          p_reason?: string;
        };
        Returns: boolean;
      };
      adjust_stock: {
        Args: {
          p_product_id: string;
          p_new_quantity: number;
          p_reason?: string;
        };
        Returns: boolean;
      };
      get_low_stock_products: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          name: string;
          slug: string;
          stock: number;
          stock_alert_threshold: number;
          status: string;
        }[];
      };
      get_product_inventory_summary: {
        Args: {
          p_product_id: string;
        };
        Returns: {
          product_id: string;
          product_name: string;
          current_stock: number;
          total_in: number;
          total_out: number;
          total_adjustments: number;
          last_movement: string | null;
        }[];
      };
      update_last_login: {
        Args: {
          user_id: string;
        };
        Returns: void;
      };
      generate_coupon_code: {
        Args: {
          length?: number;
        };
        Returns: string;
      };
      validate_coupon: {
        Args: {
          p_coupon_code: string;
          p_user_id: string;
          p_order_amount: number;
        };
        Returns: {
          is_valid: boolean;
          error_message: string | null;
          discount_amount: number;
          coupon_id: string | null;
        }[];
      };
      add_user_points: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_reason: string;
          p_reference_type?: string;
          p_created_by?: string;
        };
        Returns: number;
      };
      deduct_user_points: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_reason: string;
          p_reference_type?: string;
          p_created_by?: string;
        };
        Returns: number;
      };
      // @TASK P2-T2.7 - 조회 통계 RPC 함수
      increment_guidebook_view_count: {
        Args: {
          p_guidebook_id: string;
          p_visitor_id?: string;
          p_ip_hash?: string;
          p_user_agent?: string;
          p_referrer?: string;
        };
        Returns: void;
      };
      get_guidebook_daily_views: {
        Args: {
          p_guidebook_id: string;
          p_days?: number;
        };
        Returns: {
          view_date: string;
          view_count: number;
        }[];
      };
      get_guidebook_stats_summary: {
        Args: {
          p_guidebook_id: string;
        };
        Returns: {
          total_views: number;
          today_views: number;
          week_views: number;
          month_views: number;
        }[];
      };
      // @TASK P3-T3.5 - AI 사용량 관련 RPC 함수
      check_ai_limit: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          can_generate: boolean;
          used_this_month: number;
          limit_this_month: number;
          remaining: number;
          plan: string;
        }[];
      };
      record_ai_usage: {
        Args: {
          p_user_id: string;
          p_guidebook_id?: string;
          p_tokens_used?: number;
          p_model?: string;
          p_action?: string;
        };
        Returns: string;
      };
      get_ai_usage_history: {
        Args: {
          p_user_id: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: {
          id: string;
          guidebook_id: string | null;
          guidebook_title: string | null;
          tokens_used: number;
          model: string;
          action: string;
          created_at: string;
        }[];
      };
      reset_monthly_ai_usage: {
        Args: {
          p_user_id: string;
        };
        Returns: void;
      };
      // @TASK P5-T5.4 - 단축 URL RPC 함수
      increment_short_url_clicks: {
        Args: {
          p_code: string;
        };
        Returns: {
          guidebook_slug: string | null;
          is_expired: boolean | null;
        }[];
      };
      generate_short_code: {
        Args: {
          p_length?: number;
        };
        Returns: string;
      };
      create_short_url: {
        Args: {
          p_guidebook_id: string;
          p_expires_in_days?: number | null;
        };
        Returns: {
          id: string;
          short_code: string;
          expires_at: string | null;
        }[];
      };
      // @TASK P5-T5.5 - 공유 통계 RPC 함수
      get_share_daily_stats: {
        Args: {
          p_guidebook_id: string;
          p_days?: number;
        };
        Returns: {
          share_date: string;
          share_count: number;
          link_copies: number;
          qr_downloads: number;
          social_shares: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
