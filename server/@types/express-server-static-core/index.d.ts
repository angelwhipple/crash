import { User } from "../../models/User";
import { Community } from "../../models/Community";
declare module "express-serve-static-core" {
  interface Request {
    user?: User;
    community: Community;
  }
}
