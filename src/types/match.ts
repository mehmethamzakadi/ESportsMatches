export interface Team {
  id: number;
  name: string;
  image_url: string | null;
  acronym: string | null;
}

export interface Opponent {
  type: string;
  opponent: Team;
}

export interface Match {
  id: number;
  name: string;
  status: string;
  begin_at: string;
  end_at: string | null;
  scheduled_at: string;
  modified_at: string;
  tournament_id: number;
  league_id: number;
  serie_id: number;
  tournament: {
    id: number;
    name: string;
    slug: string;
  };
  league: {
    id: number;
    name: string;
    image_url: string | null;
  };
  serie: {
    id: number;
    name: string;
    full_name: string;
  };
  opponents: Opponent[];
  results: {
    score: number;
    team_id: number;
  }[];
  games: {
    id: number;
    status: string;
    begin_at: string | null;
    end_at: string | null;
    match_id: number;
    position: number;
    winner_id: number | null;
    winner_type: string | null;
  }[];
  streams_list: {
    language: string;
    raw_url: string;
    stream_url: string;
  }[];
} 