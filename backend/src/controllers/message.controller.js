import Message from "../models/message.model.js";
import { User } from "../models/user.model.js";

/*
 * This controller function is used to fetch all users in the database
 * except for the currently logged in user. This is used to populate the
 * user list in the sidebar of the chat app.
 */
export const getUsersForSidebar = async (req, res) => {
  try {
    // Get the ID of the currently logged in user
    const loggedInUserId = req.user._id;

    // Use the User model to find all users in the database
    // that do not have the same ID as the logged in user.
    // We exclude the password field in the data that is returned
    // since it is sensitive information.
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;

    const myId = req.user._id;

    // Use the Message model to find all messages in the database
    // where the logged-in user is either the sender or receiver,
    // and the other user is the one we want to chat with.
    // This retrieves messages sent by either user to the other.
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    // Log any errors that occur during the process
    console.log("Error in getMessages controller: ", error.message);

    // Respond with a 500 status code and an error message if something goes wrong
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;

    const { id: receiverId } = req.params;

    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // todo: real time functionality goes here --> socket io
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
