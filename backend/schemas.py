from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum

class ItemType(str, Enum):
    ASSET = "asset"
    LIABILITY = "liability"

class TagBase(BaseModel):
    name: str
    color: Optional[str] = "#6366f1"

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class EntryBase(BaseModel):
    amount: float
    date: Optional[datetime] = None
    note: Optional[str] = None

class EntryCreate(EntryBase):
    pass

class EntryUpdate(BaseModel):
    amount: Optional[float] = None
    date: Optional[datetime] = None
    note: Optional[str] = None

class Entry(EntryBase):
    id: int
    item_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ItemBase(BaseModel):
    name: str
    type: ItemType = ItemType.ASSET
    currency: Optional[str] = "INR"
    icon: Optional[str] = None

class ItemCreate(ItemBase):
    tag_ids: Optional[List[int]] = []

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    currency: Optional[str] = None
    icon: Optional[str] = None
    tag_ids: Optional[List[int]] = None

class ItemSummary(BaseModel):
    id: int
    name: str
    type: ItemType
    currency: str
    icon: Optional[str]
    tags: List[Tag]
    current_value: float
    previous_value: Optional[float]
    change_amount: float
    change_percent: Optional[float]
    last_updated: Optional[datetime]
    sparkline: List[float]
    
    class Config:
        from_attributes = True

class Item(ItemBase):
    id: int
    tags: List[Tag]
    entries: List[Entry]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class DashboardSummary(BaseModel):
    total_assets: float
    total_liabilities: float
    net_worth: float
    allocation: List[dict]
    items: List[ItemSummary]

class MonthlySavings(BaseModel):
    month: str
    savings: float
    net_worth_end: Optional[float] = None
    savings_rate_percent: Optional[float] = None

class QuarterlySavings(BaseModel):
    quarter: str
    savings: float

class InsightsSummary(BaseModel):
    net_worth: float
    month_change: float
    month_change_percent: Optional[float]
    avg_monthly_savings: float
    all_time_high: float
    all_time_high_date: Optional[datetime]
    biggest_gainer: Optional[dict]
    biggest_loser: Optional[dict]
    liability_ratio: Optional[float]
    monthly_savings: List[MonthlySavings]
    quarterly_savings: List[QuarterlySavings]

class TimeSeriesPoint(BaseModel):
    date: datetime
    value: float

class TimeSeriesResponse(BaseModel):
    item_id: int
    item_name: str
    data: List[TimeSeriesPoint]
