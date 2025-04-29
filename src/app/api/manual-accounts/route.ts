import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongo';
import ManualAccountModel from '@/models/ManualAccount'; // Import the Mongoose model
import { ManualAccount } from '@/context/ManualAccountsContext'; // Import type for request body

/**
 * GET handler to fetch all manual accounts.
 * TODO: Add user filtering later.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    console.log('[API /manual-accounts] Fetching manual accounts...');
    
    // Fetch all accounts for now (add userId filter later)
    const accounts = await ManualAccountModel.find({}); 
    
    console.log(`[API /manual-accounts] Found ${accounts.length} accounts.`);
    return NextResponse.json(accounts);

  } catch (error: any) {
    console.error('[API /manual-accounts] Error fetching accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch manual accounts' }, { status: 500 });
  }
}

/**
 * POST handler to create a new manual account.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    console.log('[API /manual-accounts] Received POST request body:', body);

    // Basic validation (more robust validation can be added)
    if (!body.accountName || !body.accountType || !body.assets || body.assets.length === 0) {
       return NextResponse.json({ error: 'Missing required account fields' }, { status: 400 });
    }

    // Calculate total value on the server-side for consistency
    const totalValue = body.assets.reduce((sum: number, asset: { value: number }) => sum + (asset.value || 0), 0);

    const newAccountData = {
      // userId: 'user_placeholder', // Add logic to get actual user ID later
      accountName: body.accountName,
      accountType: body.accountType,
      assets: body.assets, // Assume assets are already validated/formatted client-side for now
      totalValue: totalValue,
    };

    console.log('[API /manual-accounts] Creating new manual account document...');
    const newAccount = new ManualAccountModel(newAccountData);
    await newAccount.save();
    console.log('[API /manual-accounts] Manual account saved successfully:', newAccount._id);

    // Return the newly created account (or just a success message)
    return NextResponse.json(newAccount, { status: 201 });

  } catch (error: any) {
    console.error('[API /manual-accounts] Error creating account:', error);
    return NextResponse.json({ error: 'Failed to create manual account' }, { status: 500 });
  }
} 