import { GoogleUser } from "../../types.ts";
import { User } from "../user.entity.ts";


export class UserAdapter {

  static fromGooglePayload (googleUser: GoogleUser): Partial<User> {
    return {
      name: googleUser.name,
      email: googleUser.email,
      googleId: googleUser.id,
      picture: googleUser.picture,
      locale: googleUser.locale,
    };
  }
}
