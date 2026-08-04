"use client";

export function DeleteButton() {
  return <button className="button" type="submit" onClick={(event) => { if (!window.confirm("确定删除这条资料？该操作无法撤销。")) event.preventDefault(); }}>删除</button>;
}
