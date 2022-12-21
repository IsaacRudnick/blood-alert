import { HydratedDocument } from "mongoose";
import { ICase } from "./models/case.js";
import { IUser } from "./models/user.js";

type CaseObj = HydratedDocument<ICase>;
type UserObj = HydratedDocument<IUser>;

export { CaseObj, UserObj };
