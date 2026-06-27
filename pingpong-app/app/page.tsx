"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { GYM_ID, Member, Attendance } from "@/lib/types";
import { useAdmin } from "@/lib/admin";

type Banner = {
  quote: string;
  sub_text: string | null;
  link_url: string | null;
  link_label: string | null;
};

export default function AttendancePage() {
  const { isAdmin } = useAdmin();
  const [members, setMembers] = useState<Member[]>([]);
  const [activeAttendance, setActiveAttendance] = useState<Attendance[]>([]);
  const [weekendCount, setWeekendCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);

  // 회원 추가 폼 상태
  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState<"남" | "여">("남");
  const [newBirthYear, setNewBirthYear] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newExpiresAt, setNewExpiresAt] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  const todayStart = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  // 다상담 배너 가져오기
  useEffect(() => {
    fetch("https://www.dasangdam.com/api/banner")
      .then((res) => res.json())
      .then((data) => {
        if (data?.quote) setBanner(data);
      })
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);

    const { data: memberData } = await supabase
      .from("members")
      .select("*")
      .eq("gym_id", GYM_ID)
      .order("name", { ascending: true });

    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("*, member:members(*)")
      .eq("gym_id", GYM_ID)
      .gte("check_in", todayStart())
      .is("check_out", null)
      .order("check_in", { ascending: true });

    const { count } = await supabase
      .from("weekend_checkins")
      .select("*", { count: "exact", head: true })
      .eq("gym_id", GYM_ID)
      .gte("checkin_at", todayStart());

    setMembers(memberData ?? []);
    setActiveAttendance((attendanceData as unknown as Attendance[]) ?? []);
    setWeekendCount(count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeMemberIds = new Set(activeAttendance.map((a) => a.member_id));

  const handleCheckIn = async (memberId: string) => {
    await supabase.from("attendance").insert({
      gym_id: GYM_ID,
      member_id: memberId,
      check_in: new Date().toISOString(),
    });
    loadData();
  };

  const handleCheckOut = async (attendanceId: string) => {
    await supabase
      .from("attendance")
      .update({ check_out: new Date().toISOString() })
      .eq("id", attendanceId);
    loadData();
  };

  const handleAddMember = async () => {
    if (!newName.trim() || !agreed) return;
    setSaving(true);
    await supabase.from("members").insert({
      gym_id: GYM_ID,
      name: newName.trim(),
      gender: newGender,
      birth_year: newBirthYear ? parseInt(newBirthYear, 10) : null,
      phone: newPhone.trim() || null,
      expires_at: newExpiresAt || null,
    });
    setNewName("");
    setNewBirthYear("");
    setNewPhone("");
    setNewExpiresAt("");
    setNewGender("남");
    setAgreed(false);
    setShowAddForm(false);
    setSaving(false);
    loadData();
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const notAttending = filteredMembers.filter((m) => !activeMemberIds.has(m.id));

  const visibleMembers = isAdmin
    ? notAttending
    : search.trim().length > 0
    ? notAttending
    : [];

  if (loading) {
    return <div className="p-6 text-center text-gray-400">불러오는 중...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold pt-2">김찬동 탁구클럽</h1>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {activeAttendance.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">평일 출석 현황</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{weekendCount}</div>
          <div className="text-sm text-gray-500 mt-1">휴일 출석 현황</div>
        </div>
      </div>

      {/* 다상담 배너 */}
      {banner && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-700">
            {banner.quote}
          </p>
          {banner.sub_text && (
            <p
              className="text-sm text-gray-600 mt-2 leading-snug"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {banner.sub_text}
            </p>
          )}
          {banner.link_url && (
            <a
              href={banner.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs text-amber-600 hover:text-amber-700 font-medium"
            >
              자세히 보기 →
            </a>
          )}
        </div>
      )}

      {/* 출석 중인 회원 */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-2">출석 중인 회원</h2>
        {activeAttendance.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            현재 출석 중인 회원이 없습니다.
          </p>
        ) : (
          <ul className="space-y-2">
            {activeAttendance.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
              >
                <div>
                  <span className="font-medium">{a.member?.name}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(a.check_in).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    입실
                  </span>
                </div>
                <button
                  onClick={() => handleCheckOut(a.id)}
                  className="text-sm bg-gray-200 hover:bg-gray-300 rounded-full px-3 py-1"
                >
                  퇴실
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 검색 + 회원 추가 */}
      <div>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="이름을 검색해서 출석하세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          {isAdmin && (
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="bg-blue-600 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap"
            >
              + 회원 추가
            </button>
          )}
        </div>

        {isAdmin && showAddForm && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
            <input
              type="text"
              placeholder="이름"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <select
                value={newGender}
                onChange={(e) => setNewGender(e.target.value as "남" | "여")}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="남">남</option>
                <option value="여">여</option>
              </select>
              <input
                type="number"
                placeholder="출생연도 (예: 1975)"
                value={newBirthYear}
                onChange={(e) => setNewBirthYear(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <input
              type="text"
              placeholder="전화번호 (선택)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <div>
              <label className="text-xs text-gray-500">회원권 만료일 (선택)</label>
              <input
                type="date"
                value={newExpiresAt}
                onChange={(e) => setNewExpiresAt(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* 개인정보 수집·이용 동의 */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-500 leading-relaxed">
              <p className="font-medium text-gray-600 mb-1">
                개인정보 수집·이용 안내
              </p>
              <p>· 수집 항목: 이름, 성별, 출생연도, 전화번호, 회원권 만료일</p>
              <p>· 수집 목적: 출석 확인 및 레슨·회원권 관리</p>
              <p>· 보관 기간: 회원 탈퇴(삭제) 시까지, 삭제 요청 시 즉시 파기</p>
              <label className="flex items-start gap-2 mt-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5"
                />
                <span>위 내용에 동의하며 회원 등록을 진행합니다.</span>
              </label>
            </div>

            <button
              onClick={handleAddMember}
              disabled={saving || !newName.trim() || !agreed}
              className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm disabled:opacity-50"
            >
              {saving ? "저장 중..." : "회원 등록"}
            </button>
          </div>
        )}
      </div>

      {/* 미출석 회원 목록 */}
      <div>
        {isAdmin ? (
          <h2 className="font-semibold text-gray-700 mb-2">
            회원 목록 ({visibleMembers.length})
          </h2>
        ) : (
          search.trim().length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">
              이름을 검색하면 출석 처리를 할 수 있어요.
            </p>
          )
        )}

        {visibleMembers.length === 0 && (isAdmin || search.trim().length > 0) ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            {isAdmin ? "표시할 회원이 없습니다." : "일치하는 회원이 없습니다."}
          </p>
        ) : (
          <ul className="space-y-2">
            {visibleMembers.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3"
              >
                <div>
                  <span className="font-medium">{m.name}</span>
                  {isAdmin && m.gender && (
                    <span className="text-xs text-gray-400 ml-2">
                      {m.gender}
                      {m.birth_year ? ` · ${m.birth_year}` : ""}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleCheckIn(m.id)}
                  className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full px-3 py-1"
                >
                  출석
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
