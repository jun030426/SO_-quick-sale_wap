import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchBox() {
  const navigate = useNavigate();
  const [region, setRegion] = useState("전체");
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (region) {
      params.set("region", region);
    }

    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
    }

    navigate(`/listings?${params.toString()}`);
  };

  return (
    <form className="search-box" onSubmit={handleSubmit}>
      <div className="search-row">
        <select
          className="search-input"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="전체">전체 지역</option>
          <option value="서울">서울</option>
          <option value="경기">경기</option>
          <option value="인천">인천</option>
        </select>

        <input
          type="text"
          className="search-input"
          placeholder="예: 마포구, 84㎡, 신축"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <button type="submit" className="btn btn-primary">
          급매 찾기
        </button>
      </div>
    </form>
  );
}

export default SearchBox;