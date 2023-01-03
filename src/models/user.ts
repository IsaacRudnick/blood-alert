import mongoose from "mongoose";
const Schema = mongoose.Schema;

interface IUser {
  dataSource: string;
  authToken: string;
  email: string;
  phoneNumber: string;
  highThreshold: number;
  lowThreshold: number;
  ECphoneNumber: string;
  textECAfter: number;
  snoozeMinutes: number;
}

//User will later add in other data or information
const userSchema = new Schema<IUser>(
  {
    //user data source (NS such as example-bg.herokuapp.com/)
    dataSource: { type: String },
    //user auth token for NS (not necessarily needed)
    authToken: { type: String },
    // user email
    email: { type: String },
    // user's phone number
    phoneNumber: { type: String },
    // high threshold for user
    highThreshold: { type: Number },
    // low threshold for user
    lowThreshold: { type: Number },
    // which number to text if user doesn't respond (family, friend, etc.) Emergency Contact Phone Number
    ECphoneNumber: { type: String },
    // how long out-of-range readings must continue before EC is texted with alert
    textECAfter: { type: Number },
    // How long to wait before checking on user again. Minutes
    snoozeMinutes: { type: Number },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
export { IUser };
