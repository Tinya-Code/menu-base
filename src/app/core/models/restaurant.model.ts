export interface RestaurantInfo {
  data: {
    restaurant: {
      name: string;
      slug: string;
      template_id: string;
      phone: string;
      address: string;
      location: {
        lat: number;
        lng: number;
      };
    };
    settings: {
      whatsapp_config: {
        number: string;
        message_template: string;
      };
      display_config: {
        currency: string;
        language: string;
      };
      order_config: {
        delivery_fee: number;
        payment_methods: string[];
        delivery_enabled: boolean;
        max_order_quantity: number;
      };
      business_config: {
        social_media: {
          tiktok: string;
          facebook: string;
          instagram: string;
        };
        business_hours: {
          [key: string]: {
            open: string;
            close: string;
            isOpen: boolean;
          };
        };
        delivery_zones: string[];
      };
      description: string;
      tags: string[];
      logo_url: string | null;
    };
  };
}
