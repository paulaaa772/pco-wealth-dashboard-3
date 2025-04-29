import { NextRequest, NextResponse } from 'next/server';
import { connectDB, isValidObjectId } from '@/lib/mongo';
import ManualAccountModel from '@/models/ManualAccount';

interface RequestContext {
  params: {
    id: string;
  };
}

// GET a specific manual account by ID
export async function GET(req: NextRequest, { params }: RequestContext) {
  const { id } = params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid account ID format' }, { status: 400 });
  }
  try {
    await connectDB();
    const account = await ManualAccountModel.findById(id);
    if (!account) {
      return NextResponse.json({ error: 'Manual account not found' }, { status: 404 });
    }
    return NextResponse.json(account);
  } catch (error: any) {
    console.error(`[API /manual-accounts/${id}] Error fetching account:`, error);
    return NextResponse.json({ error: 'Failed to fetch manual account' }, { status: 500 });
  }
}

// PUT (update) a specific manual account by ID
export async function PUT(req: NextRequest, { params }: RequestContext) {
  const { id } = params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid account ID format' }, { status: 400 });
  }
  try {
    await connectDB();
    const body = await req.json();

    // Recalculate totalValue if assets are updated
    let totalValue = body.totalValue; // Use provided if available
    if (body.assets) {
      totalValue = body.assets.reduce((sum: number, asset: { value: number }) => sum + (asset.value || 0), 0);
    }

    const updateData = {
      ...body,
      totalValue, // Use recalculated or provided total value
      updatedAt: new Date(), // Manually set update timestamp
    };

    const updatedAccount = await ManualAccountModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } // Return updated doc, run schema validators
    );

    if (!updatedAccount) {
      return NextResponse.json({ error: 'Manual account not found' }, { status: 404 });
    }
    console.log(`[API /manual-accounts/${id}] Account updated successfully.`);
    return NextResponse.json(updatedAccount);

  } catch (error: any) {
    console.error(`[API /manual-accounts/${id}] Error updating account:`, error);
    return NextResponse.json({ error: 'Failed to update manual account' }, { status: 500 });
  }
}

// DELETE a specific manual account by ID
export async function DELETE(req: NextRequest, { params }: RequestContext) {
  const { id } = params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid account ID format' }, { status: 400 });
  }
  try {
    await connectDB();
    const deletedAccount = await ManualAccountModel.findByIdAndDelete(id);
    if (!deletedAccount) {
      return NextResponse.json({ error: 'Manual account not found' }, { status: 404 });
    }
    console.log(`[API /manual-accounts/${id}] Account deleted successfully.`);
    return NextResponse.json({ message: 'Account deleted successfully' });

  } catch (error: any) {
    console.error(`[API /manual-accounts/${id}] Error deleting account:`, error);
    return NextResponse.json({ error: 'Failed to delete manual account' }, { status: 500 });
  }
} 