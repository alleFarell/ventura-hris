"use client";

import { useState } from "react";
import { OrganizationTreeNodeResponse, OrganizationUnitResponse } from "../types";
import { MoveUnitDialog } from "./MoveUnitDialog";
import { StructureHistoryDialog } from "./StructureHistoryDialog";
import { ChevronDown, ChevronRight, FolderTree, GitFork, History, MoveRight } from "lucide-react";

type OrganizationTreeViewProps = {
  treeData: OrganizationTreeNodeResponse[];
  allUnits: OrganizationUnitResponse[];
  onRefresh: () => void;
};

type TreeNodeItemProps = {
  node: OrganizationTreeNodeResponse;
  allUnits: OrganizationUnitResponse[];
  onMoveClick: (node: OrganizationTreeNodeResponse) => void;
  onHistoryClick: (node: OrganizationTreeNodeResponse) => void;
};

function TreeNodeItem({ node, allUnits, onMoveClick, onHistoryClick }: TreeNodeItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const unitTypeBadge = () => {
    switch (node.unitType) {
      case "DEPARTMENT":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "DIVISION":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "POSITION":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="relative pl-4">
      <div className="flex items-center gap-2 py-1.5 group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-200/60 ${
            !hasChildren ? "invisible" : ""
          }`}
        >
          {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>

        <div className="flex flex-1 items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-2xs hover:border-slate-300">
          <div className="flex items-center gap-2">
            <span
              className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${unitTypeBadge()}`}
            >
              {node.unitType}
            </span>
            <span className="font-semibold text-slate-900">{node.name}</span>
            <span className="text-[11px] text-slate-400">({node.code})</span>
            {node.status !== "ACTIVE" && (
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700">
                {node.status}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onHistoryClick(node)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              title="View Change History"
            >
              <History className="h-3 w-3" />
              History
            </button>
            <button
              onClick={() => onMoveClick(node)}
              className="flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
              title="Re-parent Unit"
            >
              <MoveRight className="h-3 w-3" />
              Move
            </button>
          </div>
        </div>
      </div>

      {isOpen && hasChildren && (
        <div className="ml-2 border-l border-slate-200/80">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              allUnits={allUnits}
              onMoveClick={onMoveClick}
              onHistoryClick={onHistoryClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function OrganizationTreeView({ treeData, allUnits, onRefresh }: OrganizationTreeViewProps) {
  const [selectedForMove, setSelectedForMove] = useState<OrganizationTreeNodeResponse | null>(null);
  const [selectedForHistory, setSelectedForHistory] = useState<OrganizationTreeNodeResponse | null>(null);

  if (!treeData || treeData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <FolderTree className="h-6 w-6" />
        </div>
        <h4 className="mt-4 text-sm font-semibold text-slate-800">No Organization Hierarchy Configured</h4>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          Create departments and positions to automatically build the company's reporting structure.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <GitFork className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Organizational Reporting Tree</h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-indigo-500"></span> Department
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-500"></span> Division
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Position
          </span>
        </div>
      </div>

      <div className="space-y-1">
        {treeData.map((rootNode) => (
          <TreeNodeItem
            key={rootNode.id}
            node={rootNode}
            allUnits={allUnits}
            onMoveClick={(node) => setSelectedForMove(node)}
            onHistoryClick={(node) => setSelectedForHistory(node)}
          />
        ))}
      </div>

      {selectedForMove && (
        <MoveUnitDialog
          unit={selectedForMove}
          allUnits={allUnits}
          onClose={() => setSelectedForMove(null)}
          onSuccess={onRefresh}
        />
      )}

      {selectedForHistory && (
        <StructureHistoryDialog
          unitId={selectedForHistory.id}
          unitName={selectedForHistory.name}
          onClose={() => setSelectedForHistory(null)}
        />
      )}
    </div>
  );
}
