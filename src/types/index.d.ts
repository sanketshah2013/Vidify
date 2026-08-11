interface Genre {
  name: string;
  description?: string;
  slug?: string;
}

interface Customer {
  username: string;
  name: string;
  isGold: boolean;
  phone: number;
}

interface Movie {
  title: string;
  genre?: Genre;
  genreId?: string;
  numberInStock: number;
  dailyRentalRate: number;
}
