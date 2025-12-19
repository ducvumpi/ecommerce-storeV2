import axios from "axios";

export interface Commune {
    code: string;
    name: string;
    englishName: string;
    administrativeLevel: string;
    provinceCode: number;
    provinceName: string;
    decree: string;
}

interface PhuongXaType {
    communes: Commune[];
}

export const DiaGioiHanhChinh2Cap = async () => {
    try {
        const response = await axios.get("https://production.cas.so/address-kit/2025-07-01/communes");
        return response.data;
    } catch (error) {
        console.error(error);
    }
};

