declare global {
  namespace Express {
    interface Request {
      user: import("../modules/auth/auth.model").IUser;
    }
  }
}

export {};
