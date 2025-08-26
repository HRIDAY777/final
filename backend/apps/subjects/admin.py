from django.contrib import admin
from .models import Subject


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'code', 'credits', 'is_core', 'is_active', 'created_at'
    ]
    list_filter = ['is_core', 'is_active', 'credits', 'created_at']
    search_fields = ['name', 'code', 'description']
    list_editable = ['is_core', 'is_active']
    ordering = ['name']
