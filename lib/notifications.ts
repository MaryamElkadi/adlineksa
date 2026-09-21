import Notification from "@/models/Notification";
import { connectToDatabase } from "@/lib/mongodb";

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  link?: string;
  type?: "order" | "quote" | "proof" | "ticket" | "system";
}

export async function createNotification({
  userId,
  title,
  message,
  link = "",
  type = "system",
}: CreateNotificationParams) {
  try {
    await connectToDatabase();
    await Notification.create({
      userId,
      title,
      message,
      link,
      type,
      read: false,
    });
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);
  }
}
