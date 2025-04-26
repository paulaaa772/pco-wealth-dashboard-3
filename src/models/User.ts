import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'] 
  },
  name: { type: String, required: [true, 'Name is required'] },
  profileCreated: { type: Date, default: Date.now },
  riskProfile: { 
    type: String, 
    enum: ['conservative', 'moderate', 'aggressive'], 
    default: 'moderate' 
  },
  taxBracket: { type: Number, default: 22 },
  retirementAge: { type: Number, default: 65 },
  monthlyContribution: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's age
UserSchema.virtual('portfolios', {
  ref: 'Portfolio',
  localField: '_id',
  foreignField: 'userId'
});

UserSchema.virtual('goals', {
  ref: 'Goal',
  localField: '_id',
  foreignField: 'userId'
});

export default mongoose.models?.User || mongoose.model('User', UserSchema); 