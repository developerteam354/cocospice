export interface ICategory {
  _id:          string;
  name:         string;
  description:  string;
  categoryImage: string;
  isListed:     boolean;
  createdAt:    string;
  updatedAt:    string;
}

export interface ICreateCategoryPayload {
  name:        string;
  description: string;
}

export interface IUpdateCategoryPayload {
  name?:        string;
  description?: string;
}
