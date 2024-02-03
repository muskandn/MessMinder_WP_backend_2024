import Complaint from "../models/complaintModel.js";


//create new complaint
exports.createComplaints = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { title, description } = req.body;

    const newComplaint = await new Complaint({
      userId,
      title,
      description,
    });

    await newComplaint.save();

    res.status(200).json({
      success: true,
      message: "complaint registered",
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};


//delete complaint--- admin

exports.deleteComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return next(new ErrorHander("Product not found", 404));
  }

  await complaint.remove();

  res.status(200).json({
    success: true,
    message: "complaint Delete Successful",
  });
};


//up or down vote count
exports.updateVote=async(req,res)=>{
  const userId = req.session.userId;
  const { vote, complaintId } = req.body;

  const newVote={
    userId:userId,
    vote: vote
  }

  const complaint = await Complaint.findById(complaintId);
  
  const isVoted = complaint.count.find(
    (rev) => rev.userId.toString() === req.userId.toString()
  );

  if (isVoted) {
    complaint.count.forEach((rev) => {
      if (rev.userId.toString() === req.userId.toString())
        (rev.vote = vote);
    });
  } else {
    complaint.count.push(newVote);
    // product.numOfReviews = product.reviews.length;
  }

  let total = 0;

  complaint.count.forEach((rev) => {
    total += rev.vote;
  });

  complaint.noOfVotes=total;

  await complaint.save();
  res.status(200).json({
    success: true,
    message: "votes updated",
  });
}