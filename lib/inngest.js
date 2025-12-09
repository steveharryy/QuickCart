import { Inngest } from "inngest";
import User from "../models/User";
import dbConnect from "../config/db";   // use the one you already created

export const inngest = new Inngest({
  id: "quickcart-next",
  signingKey: process.env.INNGEST_SIGNING_KEY,
});

// ---------------------------
// USER CREATED
// ---------------------------
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },

  async ({ event }) => {
    await dbConnect();

    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    await User.create({
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    });
  }
);

// ---------------------------
// USER UPDATED
// ---------------------------
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },

  async ({ event }) => {
    await dbConnect();

    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    await User.findByIdAndUpdate(id, {
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    });
  }
);

// ---------------------------
// USER DELETED
// ---------------------------
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },

  async ({ event }) => {
    await dbConnect();

    const { id } = event.data;

    await User.findByIdAndDelete(id);
  }
);
