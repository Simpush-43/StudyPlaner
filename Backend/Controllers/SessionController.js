import Session from "../Models/Session.js";

// get sessions 
export const getSessions = async(req,res)=>{
try {
    const Sessions = await Session.find().sort({date:1})
    res.status(201).json({message:'Session found',sessions:Sessions})
} catch (err) {
  console.error('Error detected',err)
  res.status(500).json({message:'Error in getting sessions'})
}
};

// create sessions

export const CreateSessions = async ( req,res)=>{
try {
        const {
      title,
      subject,
      date,
      startTime = "",
      endTime = "",
      duration = "",
      priority = "medium",
      bookmarked = false,
      notes = "",
      status = "upcoming",
      topics = ""
    } = req.body;
  const CreateSession = await Session.create({ title,
      subject,
      date,
      startTime,
      endTime,
      duration,
      priority,
      bookmarked,
      notes,
      status,
      topics});
  res.status(201).json({message:'Session Created',session:CreateSession})
} catch (err) {
  console.error('Error detected',err)
  res.status(500).json({message:'Error in creating sessions'})
}
}

// update sessions 

export const UpdateSession = async(req,res)=>{
try {
      const {
      title,
      subject,
      date,
      startTime = "",
      endTime = "",
      duration = "",
      priority = "medium",
      bookmarked = false,
      notes = "",
      status = "upcoming",
      topics = ""
    } = req.body;
    const updatedSession = await Session.findByIdAndUpdate(req.params.id,{
        title,
        subject,
        date,
        startTime,
        endTime,
        duration,
        priority,
        bookmarked,
        notes,
        status,
        topics
      },{new:true})
    res.status(201).json({message:'Session Updated',updatedSession})  
} catch (err) {
  console.error('Error detected',err)
  res.status(500).json({message:'Error in updating sessions'})  
}
};

//deleting seesion

export const DeleteSession = async (req,res)=>{
  try {
    const DeleteSession = await Session.findByIdAndDelete(req.params.id);
    res.status(201).json({message:'Session deleted succesfully',deleted:true})
  } catch (err) {
    console.error('Error detected',err)
    res.status(500).json({message:'Error in deleting the session'})
  }
}

// toggle sessions

export const ToggleSession = async(req,res)=>{
  try {
    const  toggledSession = await Session.findById(req.params.id);
    toggledSession.bookmarked = !toggledSession.bookmarked;
    await toggledSession.save();
    res.status(201).json({message:'Session toggled succesfully',updatedSession: toggledSession})
  } catch (err) {
    console.error('Error detected',err)
    res.status(500).json({message:'Error in toggling the session'})    
  }
}

// mark completed

export const MarkSession = async(req,res)=>{
  try {
    const markedSession= await Session.findById(req.params.id)
markedSession.status = 'completed';
    await markedSession.save();
    res.status(201).json({message:'Session succesfully',updatedSession: markedSession})
  } catch (err) {
    console.error('Error detected',err)
    res.status(500).json({message:'Error in marking the session'})
  }
}