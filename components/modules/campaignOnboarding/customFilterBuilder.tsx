"use client";

import { useEffect } from "react";
import { Trash2, Plus, GripVertical, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ResCustomConnectorEnum,
  ResCustomFieldValueEnum,
  ResCustomOperatorEnum,
} from "@/generated/graphql";
export type FieldType = "number" | "date" | "boolean" | string;

export const CUSTOM_CAMPAIGN_QUERY_FIELDS = [
  {
    label: "LTV (Lifetime Value)",
    value: ResCustomFieldValueEnum.Ltv,
    type: "number",
    description: "Total amount spent by customer",
  },
  {
    label: "AIPO (Average Items per Order)",
    value: ResCustomFieldValueEnum.Aipo,
    type: "number",
    description: "Average number of items per order",
  },
  {
    label: "AOV (Average Order Value)",
    value: ResCustomFieldValueEnum.Aov,
    type: "number",
    description: "Average amount spent per order",
  },
  {
    label: "Order Count",
    value: ResCustomFieldValueEnum.OrderCount,
    type: "number",
    description: "Number of orders placed by customer",
  },
  {
    label: "Age",
    value: ResCustomFieldValueEnum.Age,
    type: "number",
    description: "Customer's current age (calculated from birthday)",
  },
  {
    label: "Loyalty Points",
    value: ResCustomFieldValueEnum.LoyaltyPoints,
    type: "number",
    description: "Total points earned in loyalty program",
  },
  {
    label: "Last Order Date",
    value: ResCustomFieldValueEnum.LastOrderDate,
    type: "date",
    description: "When the customer last placed an order",
  },
];
export const CUSTOM_CAMPAIGN_OPERATORS_BY_TYPE: Record<
  FieldType,
  { label: string; value: ResCustomOperatorEnum }[]
> = {
  number: [
    { label: "greater than", value: ResCustomOperatorEnum.Gt },
    { label: "less than", value: ResCustomOperatorEnum.Lt },
    { label: "equal to", value: ResCustomOperatorEnum.Eq },
  ],
  date: [
    { label: "before", value: ResCustomOperatorEnum.Before },
    { label: "after", value: ResCustomOperatorEnum.After },
    // { label: "in the last", value: ResCustomOperatorEnum.InLast },
    // { label: "in the coming", value: ResCustomOperatorEnum.InComing },
  ],
  boolean: [{ label: "is", value: ResCustomOperatorEnum.Is }],
};

const TIME_UNITS = [
  { label: "days", value: "days" },
  { label: "weeks", value: "weeks" },
  { label: "months", value: "months" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  label: `${i.toString().padStart(2, "0")}:00`,
  value: i.toString(),
}));

export interface Condition {
  id: string;
  field: string;
  fieldType: FieldType;
  operator: string;
  value: string | number | boolean;
  timeUnit?: string;
}

export interface ConditionGroup {
  id: string;
  type: "group";
  connector: ResCustomConnectorEnum;
  items: (Condition | ConditionGroup)[];
}

export type FilterItem = Condition | ConditionGroup;

interface ConditionItemProps {
  condition: Condition;
  onUpdate: (id: string, updates: Partial<Condition>) => void;
  onDelete: (id: string) => void;
  isOnly: boolean;
}

function ConditionItem({
  condition,
  onUpdate,
  onDelete,
  isOnly,
}: ConditionItemProps) {
  return (
    <div className="space-y-2 pt-2">
      <div className="flex flex-col md:flex-row gap-3 items-start">
        <div className="w-full md:w-1/3">
          <Select
            value={condition.field}
            onValueChange={(value) => onUpdate(condition.id, { field: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {CUSTOM_CAMPAIGN_QUERY_FIELDS.map((field) => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/4">
          <Select
            value={condition.operator}
            onValueChange={(value) =>
              onUpdate(condition.id, { operator: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              {CUSTOM_CAMPAIGN_OPERATORS_BY_TYPE[condition.fieldType].map(
                (op: any) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/3 flex gap-2 items-center">
          {condition.fieldType === "boolean" ? (
            <div className="flex items-center gap-2 w-full">
              <Select
                value={condition.value ? "true" : "false"}
                onValueChange={(value) =>
                  onUpdate(condition.id, {
                    value: value === "true",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select value" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Enabled</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : condition.fieldType === "date" &&
            condition.operator === "inLast" ? (
            <div className="flex gap-2 w-full">
              <Input
                type="number"
                value={condition.value.toString()}
                onChange={(e) =>
                  onUpdate(condition.id, {
                    value: e.target.value,
                  })
                }
                className="w-20"
                min={1}
              />
              <Select
                value={condition.timeUnit}
                onValueChange={(value) =>
                  onUpdate(condition.id, { timeUnit: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : condition.fieldType === "date" ? (
            <Input
              type="date"
              value={condition.value.toString()}
              onChange={(e) =>
                onUpdate(condition.id, { value: e.target.value })
              }
              className="w-full"
            />
          ) : condition.fieldType === "number" ? (
            // <div className="relative w-full">
            //   <span className="absolute left-3 top-1/2 -translate-y-1/2">
            //     $
            //   </span>
            //   <Input
            //     type="number"
            //     value={condition.value.toString()}
            //     onChange={(e) =>
            //       onUpdate(condition.id, {
            //         value: e.target.value,
            //       })
            //     }
            //     className="pl-7"
            //     min={0}
            //     step={0.01}
            //   />
            // </div>
            condition.field === "peakOrderHour" ? (
              <Select
                value={condition.value.toString()}
                onValueChange={(value) =>
                  onUpdate(condition.id, { value: parseInt(value) })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select hour" />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((hour) => (
                    <SelectItem key={hour.value} value={hour.value}>
                      {hour.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="relative w-full">
                {condition.field === "ltv" && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    $
                  </span>
                )}
                <Input
                  type="number"
                  value={condition.value.toString()}
                  onChange={(e) =>
                    onUpdate(condition.id, { value: e.target.value })
                  }
                  className={condition.field === "ltv" ? "pl-7" : ""}
                  min={0}
                  step={0.01}
                />
              </div>
            )
          ) : (
            <Input
              value={condition.value.toString()}
              onChange={(e) =>
                onUpdate(condition.id, { value: e.target.value })
              }
            />
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(condition.id)}
          disabled={isOnly}
          className="shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-xs text-gray-500 pl-1">
        {
          CUSTOM_CAMPAIGN_QUERY_FIELDS.find((f) => f.value === condition.field)
            ?.description
        }
      </div>
    </div>
  );
}

interface FilterBuilderGroupProps {
  group: ConditionGroup;
  onChange: (updatedGroup: ConditionGroup) => void;
  onDelete: (id: string) => void;
  isRoot?: boolean;
  level?: number;
}

function FilterBuilderGroup({
  group,
  onChange,
  onDelete,
  isRoot = false,
  level = 0,
}: FilterBuilderGroupProps) {
  const createDefaultCondition = (): Condition => ({
    id: `condition-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    field: "ltv",
    fieldType: "number",
    operator: "gt",
    value: "",
    timeUnit: "days",
  });

  const createDefaultGroup = (): ConditionGroup => ({
    id: `group-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type: "group",
    connector: ResCustomConnectorEnum.And,
    items: [createDefaultCondition()],
  });

  const handleAddCondition = () => {
    onChange({
      ...group,
      items: [...group.items, createDefaultCondition()],
    });
  };

  const handleAddGroup = () => {
    onChange({
      ...group,
      items: [...group.items, createDefaultGroup()],
    });
  };

  const handleUpdateCondition = (id: string, updates: Partial<Condition>) => {
    onChange({
      ...group,
      items: group.items.map((item) => {
        if ("type" in item) {
          // It's a group, not our target
          return item;
        }

        if (item.id === id) {
          const updatedCondition = { ...item, ...updates };

          // Handle field type changes
          if (updates.field) {
            const field = CUSTOM_CAMPAIGN_QUERY_FIELDS.find(
              (f) => f.value === updates.field
            );
            if (field && field.type !== item.fieldType) {
              updatedCondition.fieldType = field.type;
              updatedCondition.operator =
                CUSTOM_CAMPAIGN_OPERATORS_BY_TYPE[field.type][0].value;

              if (field.type === "boolean") {
                updatedCondition.value = true;
              } else {
                updatedCondition.value = "";
              }
            }
          }

          return updatedCondition;
        }

        return item;
      }),
    });
  };

  const handleUpdateGroup = (updatedChildGroup: ConditionGroup) => {
    onChange({
      ...group,
      items: group.items.map((item) =>
        "type" in item && item.id === updatedChildGroup.id
          ? updatedChildGroup
          : item
      ),
    });
  };

  const handleConnectorChange = (connector: ResCustomConnectorEnum) => {
    onChange({
      ...group,
      connector,
    });
  };

  const handleDeleteItem = (id: string) => {
    onChange({
      ...group,
      items: group.items.filter((item) =>
        "type" in item ? item.id !== id : item.id !== id
      ),
    });
  };

  return (
    <div
      className={`border rounded-lg ${
        isRoot
          ? ""
          : "border-blue-300 bg-blue-50 dark:bg-blue-950 dark:border-blue-800"
      } mb-2 p-4`}
    >
      {!isRoot && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-sm">Condition Group</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(group.id)}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {group.items.map((item, index) => (
          <div key={"type" in item ? item.id : item.id}>
            {index > 0 && (
              <div className="flex items-center gap-2 py-2">
                <div className="w-20 text-center">
                  <Select
                    value={group.connector}
                    onValueChange={handleConnectorChange}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Connector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ResCustomConnectorEnum.And}>
                        AND
                      </SelectItem>
                      <SelectItem value={ResCustomConnectorEnum.Or}>
                        OR
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {"type" in item ? (
              <FilterBuilderGroup
                group={item}
                onChange={handleUpdateGroup}
                onDelete={handleDeleteItem}
                level={level + 1}
              />
            ) : (
              <ConditionItem
                condition={item}
                onUpdate={handleUpdateCondition}
                onDelete={handleDeleteItem}
                isOnly={group.items.length === 1}
              />
            )}
          </div>
        ))}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddCondition}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add Condition
          </Button>

          {/* FIXME:ADD GROUP BUTTON IS HERE - NEED TO TO BE IMPLEMENTED IN BACKEND INPUT */}
          {/* <Button
            variant="outline"
            size="sm"
            onClick={handleAddGroup}
            className="flex items-center gap-1"
          >
            <Layers className="h-4 w-4" /> Add Group
          </Button> */}
        </div>
      </div>
    </div>
  );
}

export const DEFAULT_ROOT_GROUP: ConditionGroup = {
  id: "root",
  type: "group",
  connector: ResCustomConnectorEnum.And,
  items: [
    {
      id: "initial-condition",
      field: ResCustomFieldValueEnum.Ltv,
      fieldType: "number",
      operator: ResCustomOperatorEnum.Gt,
      value: "",
      timeUnit: "days",
    },
  ],
};

interface CustomFilterBuilderProps {
  conditions: ConditionGroup;
  setConditions: (conditions: ConditionGroup) => void;
}

export default function CustomFilterBuilder({
  conditions,
  setConditions,
}: CustomFilterBuilderProps) {
  return (
    <FilterBuilderGroup
      group={conditions}
      onChange={setConditions}
      onDelete={() => {}} // Root can't be deleted
      isRoot={true}
    />
  );
}
