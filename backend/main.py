from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta, timezone
from dateutil.relativedelta import relativedelta
from typing import List, Optional
import calendar
import os

from database import engine, get_db, Base
from models import Item as ItemModel, Entry as EntryModel, Tag as TagModel, User as UserModel, ItemType as ModelItemType
from schemas import (
    Item, ItemCreate, ItemUpdate, ItemSummary,
    Entry, EntryCreate, EntryUpdate,
    Tag, TagCreate,
    DashboardSummary, InsightsSummary, TimeSeriesResponse, TimeSeriesPoint,
    ItemType
)
from auth import (
    Token, UserCreate, UserLogin, UserResponse,
    create_access_token, authenticate_user, create_user,
    get_user_by_email, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Portfolio Manager API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth endpoints
@app.post("/api/auth/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    db_user = create_user(db, user)
    return db_user

@app.post("/api/auth/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: UserModel = Depends(get_current_user)):
    return current_user

# Tags endpoints
@app.post("/api/tags", response_model=Tag)
def create_tag(
    tag: TagCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    db_tag = TagModel(**tag.model_dump(), user_id=current_user.id)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

@app.get("/api/tags", response_model=List[Tag])
def get_tags(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return db.query(TagModel).filter(TagModel.user_id == current_user.id).all()

@app.delete("/api/tags/{tag_id}")
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    tag = db.query(TagModel).filter(
        TagModel.id == tag_id,
        TagModel.user_id == current_user.id
    ).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    db.delete(tag)
    db.commit()
    return {"message": "Tag deleted"}

# Items endpoints
@app.post("/api/items", response_model=Item)
def create_item(
    item: ItemCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    item_data = item.model_dump(exclude={'tag_ids'})
    db_item = ItemModel(**item_data, user_id=current_user.id)
    
    if item.tag_ids:
        tags = db.query(TagModel).filter(
            TagModel.id.in_(item.tag_ids),
            TagModel.user_id == current_user.id
        ).all()
        db_item.tags = tags
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/api/items", response_model=List[Item])
def get_items(
    type: Optional[ItemType] = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    query = db.query(ItemModel).filter(ItemModel.user_id == current_user.id)
    if type:
        query = query.filter(ItemModel.type == type.value)
    return query.all()

@app.get("/api/items/{item_id}", response_model=Item)
def get_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    item = db.query(ItemModel).filter(
        ItemModel.id == item_id,
        ItemModel.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.put("/api/items/{item_id}", response_model=Item)
def update_item(
    item_id: int,
    item: ItemUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    db_item = db.query(ItemModel).filter(
        ItemModel.id == item_id,
        ItemModel.user_id == current_user.id
    ).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = item.model_dump(exclude_unset=True, exclude={'tag_ids'})
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    if item.tag_ids is not None:
        tags = db.query(TagModel).filter(
            TagModel.id.in_(item.tag_ids),
            TagModel.user_id == current_user.id
        ).all()
        db_item.tags = tags
    
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/api/items/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    item = db.query(ItemModel).filter(
        ItemModel.id == item_id,
        ItemModel.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item deleted"}

# Entries endpoints
@app.post("/api/items/{item_id}/entries", response_model=Entry)
def create_entry(
    item_id: int,
    entry: EntryCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    item = db.query(ItemModel).filter(
        ItemModel.id == item_id,
        ItemModel.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    entry_data = entry.model_dump()
    if entry_data['date'] is None:
        entry_data['date'] = datetime.now(timezone.utc)
    
    db_entry = EntryModel(item_id=item_id, **entry_data)
    db.add(db_entry)
    
    item.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.get("/api/items/{item_id}/entries", response_model=List[Entry])
def get_entries(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    item = db.query(ItemModel).filter(
        ItemModel.id == item_id,
        ItemModel.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return db.query(EntryModel).filter(EntryModel.item_id == item_id).order_by(desc(EntryModel.date)).all()

@app.put("/api/entries/{entry_id}", response_model=Entry)
def update_entry(
    entry_id: int,
    entry: EntryUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    db_entry = db.query(EntryModel).join(ItemModel).filter(
        EntryModel.id == entry_id,
        ItemModel.user_id == current_user.id
    ).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    update_data = entry.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_entry, key, value)
    
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.delete("/api/entries/{entry_id}")
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    entry = db.query(EntryModel).join(ItemModel).filter(
        EntryModel.id == entry_id,
        ItemModel.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Entry deleted"}

# Dashboard endpoint
def get_item_summary(item: ItemModel, db: Session) -> dict:
    entries = db.query(EntryModel).filter(
        EntryModel.item_id == item.id
    ).order_by(desc(EntryModel.date)).limit(30).all()
    
    current_value = entries[0].amount if entries else 0
    previous_value = entries[1].amount if len(entries) > 1 else None
    
    change_amount = current_value - (previous_value or 0)
    change_percent = None
    if previous_value and previous_value != 0:
        change_percent = (change_amount / previous_value) * 100
    
    sparkline = [e.amount for e in reversed(entries[:10])]
    
    last_updated = entries[0].date if entries else None
    
    return {
        "id": item.id,
        "name": item.name,
        "type": item.type,
        "currency": item.currency,
        "icon": item.icon,
        "tags": item.tags,
        "current_value": current_value,
        "previous_value": previous_value,
        "change_amount": change_amount,
        "change_percent": change_percent,
        "last_updated": last_updated,
        "sparkline": sparkline
    }

@app.get("/api/dashboard", response_model=DashboardSummary)
def get_dashboard(
    sort_by: str = Query("value", enum=["value", "name", "updated"]),
    sort_order: str = Query("desc", enum=["asc", "desc"]),
    tag_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    query = db.query(ItemModel).filter(ItemModel.user_id == current_user.id)
    
    if tag_id:
        query = query.filter(ItemModel.tags.any(TagModel.id == tag_id))
    
    if search:
        query = query.filter(ItemModel.name.ilike(f"%{search}%"))
    
    items = query.all()
    
    item_summaries = [get_item_summary(item, db) for item in items]
    
    if sort_by == "value":
        item_summaries.sort(key=lambda x: x["current_value"], reverse=(sort_order == "desc"))
    elif sort_by == "name":
        item_summaries.sort(key=lambda x: x["name"].lower(), reverse=(sort_order == "desc"))
    elif sort_by == "updated":
        item_summaries.sort(
            key=lambda x: x["last_updated"] or datetime.min,
            reverse=(sort_order == "desc")
        )
    
    total_assets = sum(s["current_value"] for s in item_summaries if s["type"] == "asset")
    total_liabilities = sum(s["current_value"] for s in item_summaries if s["type"] == "liability")
    net_worth = total_assets - total_liabilities
    
    allocation = []
    categories = {}
    
    for s in item_summaries:
        if s["type"] == "asset":
            for tag in s["tags"]:
                if tag.name not in categories:
                    categories[tag.name] = {"name": tag.name, "value": 0, "color": tag.color}
                categories[tag.name]["value"] += s["current_value"]
    
    for s in item_summaries:
        if s["type"] == "asset" and not s["tags"]:
            if "Other" not in categories:
                categories["Other"] = {"name": "Other", "value": 0, "color": "#6b7280"}
            categories["Other"]["value"] += s["current_value"]
    
    if not categories:
        for s in item_summaries:
            if s["type"] == "asset":
                categories[s["name"]] = {"name": s["name"], "value": s["current_value"], "color": "#6366f1"}
    
    allocation = list(categories.values())
    
    return DashboardSummary(
        total_assets=total_assets,
        total_liabilities=total_liabilities,
        net_worth=net_worth,
        allocation=allocation,
        items=item_summaries
    )

# Insights endpoint
def to_naive_datetime(dt):
    """Convert any date/datetime to naive datetime for comparison"""
    if dt is None:
        return None
    if isinstance(dt, datetime):
        return dt.replace(tzinfo=None) if dt.tzinfo else dt
    # If it's a date object, convert to datetime
    return datetime.combine(dt, datetime.min.time())

@app.get("/api/insights", response_model=InsightsSummary)
def get_insights(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    items = db.query(ItemModel).filter(ItemModel.user_id == current_user.id).all()
    
    item_summaries = [get_item_summary(item, db) for item in items]
    
    total_assets = sum(s["current_value"] for s in item_summaries if s["type"] == "asset")
    total_liabilities = sum(s["current_value"] for s in item_summaries if s["type"] == "liability")
    net_worth = total_assets - total_liabilities
    
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_start_naive = month_start.replace(tzinfo=None)
    
    month_start_values = {}
    for item in items:
        try:
            entry = db.query(EntryModel).filter(
                EntryModel.item_id == item.id
            ).order_by(desc(EntryModel.date)).first()
            
            if entry:
                entry_date = to_naive_datetime(entry.date)
                if entry_date and entry_date <= month_start_naive:
                    month_start_values[item.id] = entry.amount
                else:
                    # Get the entry closest to month start
                    closest_entry = db.query(EntryModel).filter(
                        EntryModel.item_id == item.id
                    ).order_by(EntryModel.date).first()
                    if closest_entry:
                        closest_date = to_naive_datetime(closest_entry.date)
                        if closest_date and closest_date <= month_start_naive:
                            month_start_values[item.id] = closest_entry.amount
                        else:
                            month_start_values[item.id] = 0
                    else:
                        month_start_values[item.id] = 0
            else:
                month_start_values[item.id] = 0
        except Exception:
            month_start_values[item.id] = 0
    
    month_start_assets = sum(
        month_start_values.get(item.id, 0) for item in items if item.type == "asset"
    )
    month_start_liabilities = sum(
        month_start_values.get(item.id, 0) for item in items if item.type == "liability"
    )
    month_start_net_worth = month_start_assets - month_start_liabilities
    
    month_change = net_worth - month_start_net_worth
    month_change_percent = None
    if month_start_net_worth != 0:
        month_change_percent = (month_change / abs(month_start_net_worth)) * 100
    
    monthly_net_worths = []
    monthly_dates = []
    for i in range(12):
        date = now - relativedelta(months=i)
        month_end = date.replace(day=1) - timedelta(days=1) if i > 0 else now
        month_end_naive = month_end.replace(tzinfo=None)
        monthly_dates.append(date)
        
        month_values = {}
        for item in items:
            try:
                # Get all entries and filter in Python to avoid date comparison issues
                entries = db.query(EntryModel).filter(
                    EntryModel.item_id == item.id
                ).order_by(desc(EntryModel.date)).all()
                
                for entry in entries:
                    entry_date = to_naive_datetime(entry.date)
                    if entry_date and entry_date <= month_end_naive:
                        month_values[item.id] = (entry.amount, item.type)
                        break
            except Exception:
                pass
        
        assets = sum(v[0] for v in month_values.values() if v[1] == "asset")
        liabilities = sum(v[0] for v in month_values.values() if v[1] == "liability")
        monthly_net_worths.append(assets - liabilities)
    
    savings = []
    for i in range(len(monthly_net_worths) - 1):
        savings.append(monthly_net_worths[i] - monthly_net_worths[i + 1])
    
    avg_monthly_savings = sum(savings) / len(savings) if savings else 0
    
    monthly_savings_data = []
    for i in range(min(len(savings), 12)):
        month_name = monthly_dates[i].strftime("%b")
        monthly_savings_data.append({
            "month": month_name,
            "savings": savings[i] if i < len(savings) else 0
        })
    monthly_savings_data.reverse()
    
    quarterly_savings_data = []
    quarter_names = ["Q1", "Q2", "Q3", "Q4"]
    for q in range(4):
        start_idx = q * 3
        end_idx = min(start_idx + 3, len(savings))
        if start_idx < len(savings):
            quarter_savings = sum(savings[start_idx:end_idx])
            current_quarter = (now.month - 1) // 3
            quarter_idx = (current_quarter - q) % 4
            year_offset = (current_quarter - q) // 4
            year = now.year if year_offset >= 0 else now.year - 1
            quarterly_savings_data.append({
                "quarter": f"{quarter_names[quarter_idx]} {year}",
                "savings": quarter_savings
            })
    quarterly_savings_data.reverse()
    
    all_time_high = max(monthly_net_worths) if monthly_net_worths else net_worth
    all_time_high = max(all_time_high, net_worth)
    
    all_time_high_date = None
    if all_time_high == net_worth:
        all_time_high_date = now
    
    asset_items = [s for s in item_summaries if s["type"] == "asset" and s["change_percent"] is not None]
    biggest_gainer = None
    biggest_loser = None
    
    if asset_items:
        gainers = [s for s in asset_items if s["change_percent"] > 0]
        losers = [s for s in asset_items if s["change_percent"] < 0]
        
        if gainers:
            gainer = max(gainers, key=lambda x: x["change_percent"])
            biggest_gainer = {
                "name": gainer["name"],
                "change_percent": gainer["change_percent"],
                "change_amount": gainer["change_amount"]
            }
        
        if losers:
            loser = min(losers, key=lambda x: x["change_percent"])
            biggest_loser = {
                "name": loser["name"],
                "change_percent": loser["change_percent"],
                "change_amount": loser["change_amount"]
            }
    
    liability_ratio = None
    if total_assets > 0:
        liability_ratio = (total_liabilities / total_assets) * 100
    
    return InsightsSummary(
        net_worth=net_worth,
        month_change=month_change,
        month_change_percent=month_change_percent,
        avg_monthly_savings=avg_monthly_savings,
        all_time_high=all_time_high,
        all_time_high_date=all_time_high_date,
        biggest_gainer=biggest_gainer,
        biggest_loser=biggest_loser,
        liability_ratio=liability_ratio,
        monthly_savings=monthly_savings_data,
        quarterly_savings=quarterly_savings_data
    )

# Time series endpoint
@app.get("/api/items/{item_id}/timeseries", response_model=TimeSeriesResponse)
def get_timeseries(
    item_id: int,
    range: str = Query("all", enum=["6m", "ytd", "1y", "2y", "4y", "5y", "all"]),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    item = db.query(ItemModel).filter(
        ItemModel.id == item_id,
        ItemModel.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    now = datetime.now(timezone.utc)
    start_date = None
    
    if range == "6m":
        start_date = now - relativedelta(months=6)
    elif range == "ytd":
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    elif range == "1y":
        start_date = now - relativedelta(years=1)
    elif range == "2y":
        start_date = now - relativedelta(years=2)
    elif range == "4y":
        start_date = now - relativedelta(years=4)
    elif range == "5y":
        start_date = now - relativedelta(years=5)
    
    query = db.query(EntryModel).filter(EntryModel.item_id == item_id)
    if start_date:
        query = query.filter(EntryModel.date >= start_date)
    
    entries = query.order_by(EntryModel.date).all()
    
    data = [TimeSeriesPoint(date=e.date, value=e.amount) for e in entries]
    
    return TimeSeriesResponse(
        item_id=item.id,
        item_name=item.name,
        data=data
    )

# Net Worth History endpoint
@app.get("/api/networth-history")
def get_networth_history(
    range: str = Query("1y", enum=["6m", "ytd", "1y", "2y", "4y", "5y", "all"]),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    items = db.query(ItemModel).filter(ItemModel.user_id == current_user.id).all()
    
    if not items:
        return {"data": []}
    
    now = datetime.now(timezone.utc)
    start_date = None
    
    if range == "6m":
        start_date = now - relativedelta(months=6)
    elif range == "ytd":
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    elif range == "1y":
        start_date = now - relativedelta(years=1)
    elif range == "2y":
        start_date = now - relativedelta(years=2)
    elif range == "4y":
        start_date = now - relativedelta(years=4)
    elif range == "5y":
        start_date = now - relativedelta(years=5)
    
    all_entries = db.query(EntryModel).join(ItemModel).filter(
        ItemModel.user_id == current_user.id
    ).order_by(EntryModel.date).all()
    
    if start_date:
        start_date_naive = start_date.replace(tzinfo=None)
        all_entries = [e for e in all_entries if to_naive_datetime(e.date) >= start_date_naive]
    
    unique_dates = sorted(set(to_naive_datetime(e.date).date() for e in all_entries if e.date))
    
    if not unique_dates:
        return {"data": []}
    
    history = []
    item_latest_values = {item.id: 0 for item in items}
    item_types = {item.id: item.type for item in items}
    
    all_item_entries = {}
    for item in items:
        entries = db.query(EntryModel).filter(
            EntryModel.item_id == item.id
        ).order_by(EntryModel.date).all()
        all_item_entries[item.id] = entries
    
    for date in unique_dates:
        for item_id, entries in all_item_entries.items():
            for entry in entries:
                entry_date = to_naive_datetime(entry.date).date() if entry.date else None
                if entry_date and entry_date <= date:
                    item_latest_values[item_id] = entry.amount
        
        total_assets = sum(v for item_id, v in item_latest_values.items() if item_types[item_id] == "asset")
        total_liabilities = sum(v for item_id, v in item_latest_values.items() if item_types[item_id] == "liability")
        net_worth = total_assets - total_liabilities
        
        history.append({
            "date": date.isoformat(),
            "net_worth": net_worth,
            "assets": total_assets,
            "liabilities": total_liabilities
        })
    
    return {"data": history}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
