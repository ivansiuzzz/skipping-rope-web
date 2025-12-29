export interface EventRole {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GrantRoleRequest {
  userId: string;
  role: string;
}
