const Rating=require("../models/ratingModel")

//take rating ---students

exports.takeRating=async(req,res)=>{
    const {rating, itemId}=req.body;

    // const itemRating={
    //     rating: Number(rating),

    // }

    const item=await Rating.findById(itemId);
    if(item){
        let avg=0;
        item.count=item.count+1;

        avg=((item.rating*item.count) + rating )/cnt+1;
        item.rating=avg;

    }else{
        item.rating=rating;
        item.count=1;
    }

    await item.save();

    res.status(200).json({
      success: true,
    });

}

