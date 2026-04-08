export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
        };
        Update: {
          display_name?: string | null;
        };
      };
      connections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string | null;
          data: ConnectionData;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          name: string;
          color?: string | null;
          data: ConnectionData;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          color?: string | null;
          data?: ConnectionData;
          updated_at?: string;
        };
      };
      invitations: {
        Row: {
          id: string;
          token: string;
          user_id: string;
          connection_id: string;
          profile_snapshot: ProfileSnapshot;
          status: 'pending' | 'completed';
          created_at: string;
        };
        Insert: {
          id?: string;
          token: string;
          user_id: string;
          connection_id: string;
          profile_snapshot: ProfileSnapshot;
          status?: 'pending' | 'completed';
        };
        Update: {
          status?: 'pending' | 'completed';
        };
      };
      responses: {
        Row: {
          id: string;
          invitation_id: string;
          responder_name: string;
          responder_color: string | null;
          response_data: ProfileSnapshot;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          responder_name: string;
          responder_color?: string | null;
          response_data: ProfileSnapshot;
        };
        Update: never;
      };
    };
  };
}

// JSON data stored in the `data` column of connections
export interface ConnectionData {
  emoji: string;
  categories: {
    categoryId: string;
    ratings: { subcategory: string; tier: string }[];
  }[];
  timeRhythm: {
    communication: string[];
    inPerson: string[];
    custom: string[];
  };
}

// Snapshot stored in invitations/responses (full connection profile)
export interface ProfileSnapshot {
  name: string;
  color: string;
  emoji: string;
  categories: {
    categoryId: string;
    ratings: { subcategory: string; tier: string }[];
  }[];
  timeRhythm: {
    communication: string[];
    inPerson: string[];
    custom: string[];
  };
}
