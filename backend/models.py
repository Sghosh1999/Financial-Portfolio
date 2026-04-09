from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Table, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from database import Base

class ItemType(str, enum.Enum):
    ASSET = "asset"
    LIABILITY = "liability"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    avatar_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    items = relationship("Item", back_populates="user", cascade="all, delete-orphan")
    tags = relationship("Tag", back_populates="user", cascade="all, delete-orphan")

item_tags = Table(
    'item_tags',
    Base.metadata,
    Column('item_id', Integer, ForeignKey('items.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    name = Column(String, index=True)
    color = Column(String, default="#6366f1")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="tags")
    items = relationship("Item", secondary=item_tags, back_populates="tags")

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    name = Column(String, index=True)
    type = Column(String, default=ItemType.ASSET.value)
    currency = Column(String, default="INR")
    icon = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="items")
    tags = relationship("Tag", secondary=item_tags, back_populates="items")
    entries = relationship("Entry", back_populates="item", cascade="all, delete-orphan", order_by="desc(Entry.date)")

class Entry(Base):
    __tablename__ = "entries"
    
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), index=True)
    amount = Column(Float)
    date = Column(DateTime, default=datetime.utcnow, index=True)
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    item = relationship("Item", back_populates="entries")
