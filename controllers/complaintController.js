import Complaint from "../models/complaintModel.js";

export const complaintController = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { title, description } = req.body;

    const newComplaint = await new Complaint({
      userId,
      title,
      description,
    });
    await newComplaint.save();
    return res.status(200).send("complaint registered!")
  } catch(error) {
    return res.status(500).json(error.message);
  }
};
