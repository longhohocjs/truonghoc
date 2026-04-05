import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";

const LichHoc = () => {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [hocKy, setHocKy] = useState("");

  const daysOfWeek = [
    { label: "Thứ 2", value: 2 },
    { label: "Thứ 3", value: 3 },
    { label: "Thứ 4", value: 4 },
    { label: "Thứ 5", value: 5 },
    { label: "Thứ 6", value: 6 },
    { label: "Thứ 7", value: 7 },
    { label: "Chủ Nhật", value: 8 },
  ];

  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 1); // Tiết 1 đến tiết 12

  useEffect(() => {
    const fetchLichHoc = async () => {
      try {
        const response = await axiosClient.get("/sinh-vien/da-dang-ky");
        if (response.data) {
          setHocKy(response.hoc_ky);
          processSchedule(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải lịch học:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLichHoc();
  }, []);

  const processSchedule = (data) => {
    const mappedSchedule = {};
    data.forEach((item) => {
      const lop = item.lop_hoc_phan;
      lop.lich_hoc?.forEach((lich) => {
        const key = `${lich.Thu}-${lich.TietBatDau}`;
        mappedSchedule[key] = {
          tenMon: lop.mon_hoc?.TenMon,
          maLop: lop.MaLopHP,
          phong: lich.PhongHoc || "Đang cập nhật",
          giangVien: lop.giang_vien?.HoTen,
          soTiet: lich.SoTiet,
        };
      });
    });
    setSchedule(mappedSchedule);
  };

  if (loading)
    return <div className="p-10 text-center">Đang tải thời khóa biểu...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Thời khóa biểu cá nhân
          </h2>
          <p className="text-gray-500 text-sm">Học kỳ: {hocKy}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm flex items-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          In lịch học
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed min-w-[800px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="w-20 py-4 border-b border-r border-gray-100 text-xs font-bold text-gray-400 uppercase">
                  Tiết
                </th>
                {daysOfWeek.map((day) => (
                  <th
                    key={day.value}
                    className="py-4 border-b border-r border-gray-100 text-sm font-bold text-gray-700"
                  >
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot} className="h-20">
                  <td className="text-center border-b border-r border-gray-100 bg-gray-50/50">
                    <span className="text-xs font-bold text-gray-500">
                      Tiết {slot}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {slot === 1
                        ? "07:00"
                        : slot === 5
                          ? "10:30"
                          : slot === 7
                            ? "13:00"
                            : ""}
                    </div>
                  </td>
                  {daysOfWeek.map((day) => {
                    const cellData = schedule[`${day.value}-${slot}`];

                    // Logic để gộp ô nếu môn học kéo dài nhiều tiết
                    // Ở đây chúng ta kiểm tra xem tiết hiện tại có nằm trong khoảng của một môn học đã bắt đầu ở tiết trước không
                    let isInsideGroup = false;
                    for (let s = 1; s < slot; s++) {
                      const prevData = schedule[`${day.value}-${s}`];
                      if (prevData && s + prevData.soTiet > slot) {
                        isInsideGroup = true;
                        break;
                      }
                    }

                    if (isInsideGroup) return null;

                    return (
                      <td
                        key={`${day.value}-${slot}`}
                        rowSpan={cellData?.soTiet || 1}
                        className={`p-2 border-b border-r border-gray-100 align-top transition-all ${
                          cellData ? "bg-blue-50/50" : "hover:bg-gray-50/30"
                        }`}
                      >
                        {cellData && (
                          <div className="h-full bg-blue-100/50 border-l-4 border-blue-500 p-2 rounded-r-lg shadow-sm">
                            <div className="text-xs font-bold text-blue-800 leading-tight mb-1">
                              {cellData.tenMon}
                            </div>
                            <div className="text-[10px] text-blue-600 font-medium">
                              📍 {cellData.phong}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-1 truncate">
                              👤 {cellData.giangVien}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LichHoc;
