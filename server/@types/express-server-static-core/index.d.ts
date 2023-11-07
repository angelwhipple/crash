import { User } from "../../models/User";
import { Template } from "../../models/Template";
import { Community } from "../../models/Community";
declare module "express-serve-static-core" {
  interface Request {
    user?: User;
    template?: Template;
    community?: Community;
  }
}
