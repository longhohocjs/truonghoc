import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";

const LichHoc = () => {
  const [schedule, setSchedule] = useState({});
  const [rawLichData, setRawLichData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hocKy, setHocKy] = useState("");

  // Hàm lấy ngày Thứ 2 của tuần chứa ngày được chọn
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(
    getStartOfWeek(new Date()),
  );

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
          setRawLichData(response.data);
          processSchedule(response.data, currentWeekStart);
        }
      } catch (error) {
        console.error("Lỗi khi tải lịch học:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLichHoc();
  }, []);

  // Chạy lại logic xử lý lịch mỗi khi đổi tuần
  useEffect(() => {
    if (rawLichData.length > 0) {
      processSchedule(rawLichData, currentWeekStart);
    }
  }, [currentWeekStart, rawLichData]);

  const processSchedule = (data, weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const mappedSchedule = {};
    data.forEach((item) => {
      const lop = item.lop_hoc_phan;
      lop.lich_hoc?.forEach((lich) => {
        const ngayHoc = new Date(lich.NgayHoc);

        // Chỉ lấy các buổi học nằm trong khoảng từ Thứ 2 đến Chủ Nhật của tuần đang chọn
        if (ngayHoc >= weekStart && ngayHoc <= weekEnd) {
          let thuVal = ngayHoc.getDay();
          thuVal = thuVal === 0 ? 8 : thuVal + 1;

          const key = `${thuVal}-${lich.TietBatDau || lich.tiet_bat_dau}`;
          mappedSchedule[key] = {
            tenMon: lop.mon_hoc?.TenMon || lop.mon_hoc?.ten_mon,
            maLop: lop.MaLopHP || lop.ma_lop_hp,
            phong: lich.PhongHoc || lich.phong_hoc || "Đang cập nhật",
            giangVien: lop.giang_vien?.HoTen || lop.giang_vien?.ho_ten,
            soTiet: lich.SoTiet || lich.so_tiet,
          };
        }
      });
    });
    setSchedule(mappedSchedule);
  };

  const changeWeek = (offset) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + offset * 7);
    setCurrentWeekStart(newDate);
  };

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

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
        <div className="flex items-center space-x-3">
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={() => changeWeek(-1)}
              className="px-3 py-2 hover:bg-gray-50 text-gray-600 border-r border-gray-200"
            >
              ◀
            </button>
            <div className="px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50/50">
              {currentWeekStart.toLocaleDateString("vi-VN")} -{" "}
              {weekEnd.toLocaleDateString("vi-VN")}
            </div>
            <button
              onClick={() => changeWeek(1)}
              className="px-3 py-2 hover:bg-gray-50 text-gray-600"
            >
              ▶
            </button>
          </div>
          <button
            onClick={() => setCurrentWeekStart(getStartOfWeek(new Date()))}
            className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Tuần này
          </button>
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
          >
            In lịch
          </button>
        </div>
      </div>

      {Object.keys(schedule).length === 0 && !loading && (
        <div className="bg-blue-50 border border-blue-100 text-blue-600 p-4 rounded-xl text-center text-sm font-medium">
          Bạn không có lịch học trong tuần này.
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed min-w-[800px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="w-20 py-4 border-b border-r border-gray-100 text-xs font-bold text-gray-400 uppercase">
                  Tiết
                </th>
                {daysOfWeek.map((day, index) => {
                  const dateLabel = new Date(currentWeekStart);
                  dateLabel.setDate(dateLabel.getDate() + index);
                  return (
                    <th
                      key={day.value}
                      className="py-4 border-b border-r border-gray-100 text-sm font-bold text-gray-700"
                    >
                      <div>{day.label}</div>
                      <div className="text-[10px] text-gray-400 font-normal mt-1">
                        {dateLabel.getDate()}/{dateLabel.getMonth() + 1}
                      </div>
                    </th>
                  );
                })}
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
                    // Kiểm tra xem tiết hiện tại có thuộc khoảng thời gian của môn học đã bắt đầu ở tiết trước
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
                        className={`p-1.5 border-b border-r border-gray-100 align-top transition-all ${
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
