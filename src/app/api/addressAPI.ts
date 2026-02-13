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
        const response = await axios.get("/api/communes");
        console.log("API response:", response);
        return response.data;
    } catch (error) {
        console.error("API ERROR:", error);
        throw error;
    }
};
