import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
    const res = await axios.get(
        "https://production.cas.so/address-kit/2025-07-01/communes"
    );
    return NextResponse.json(res.data);
}
