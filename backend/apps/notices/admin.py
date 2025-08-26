from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    Notice, NoticeCategory, NoticeAttachment, 
    NoticeRecipient, NoticeTemplate
)
from django.utils import timezone


@admin.register(NoticeCategory)
class NoticeCategoryAdmin(admin.ModelAdmin):
    """Admin interface for NoticeCategory"""
    
    list_display = [
        'name', 'description', 'color_display', 'icon', 
        'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'is_active')
        }),
        ('Styling', {
            'fields': ('color', 'icon')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def color_display(self, obj):
        """Display color as a colored square"""
        if obj.color:
            return format_html(
                '<div style="background-color: {}; width: 20px; height: 20px; '
                'border-radius: 3px; border: 1px solid #ccc;"></div>',
                obj.color
            )
        return '-'
    color_display.short_description = 'Color'


class NoticeAttachmentInline(admin.TabularInline):
    """Inline admin for NoticeAttachment"""
    
    model = NoticeAttachment
    extra = 1
    readonly_fields = ['file_size', 'created_at']
    fields = ['file', 'filename', 'file_type', 'description']


class NoticeRecipientInline(admin.TabularInline):
    """Inline admin for NoticeRecipient"""
    
    model = NoticeRecipient
    extra = 0
    readonly_fields = [
        'user_name', 'user_email', 'email_sent', 'sms_sent', 
        'push_sent', 'is_read', 'read_at', 'created_at'
    ]
    fields = [
        'user', 'user_name', 'user_email', 'email_sent', 
        'sms_sent', 'push_sent', 'is_read', 'read_at'
    ]
    
    def user_name(self, obj):
        return obj.user.get_full_name() if obj.user else '-'
    user_name.short_description = 'User Name'
    
    def user_email(self, obj):
        return obj.user.email if obj.user else '-'
    user_email.short_description = 'Email'


@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    """Admin interface for Notice"""
    
    list_display = [
        'title', 'category', 'priority', 'status', 'target_audience',
        'author_name', 'publish_date', 'is_published', 'pin_to_top',
        'views_count', 'read_count', 'created_at'
    ]
    list_filter = [
        'status', 'priority', 'category', 'target_audience',
        'requires_approval', 'pin_to_top', 'send_email', 'send_sms',
        'send_push', 'publish_date', 'created_at'
    ]
    search_fields = ['title', 'content', 'summary', 'author__first_name', 'author__last_name']
    ordering = ['-publish_date', '-created_at']
    readonly_fields = [
        'views_count', 'read_count', 'is_expired', 'is_published',
        'created_at', 'updated_at', 'published_at'
    ]
    filter_horizontal = ['target_classes', 'target_users']
    date_hierarchy = 'publish_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'content', 'summary', 'category')
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority', 'pin_to_top')
        }),
        ('Targeting', {
            'fields': (
                'target_audience', 'target_classes', 'target_users'
            )
        }),
        ('Scheduling', {
            'fields': ('publish_date', 'expiry_date')
        }),
        ('Author & Approval', {
            'fields': (
                'author', 'requires_approval', 'approved_by', 'approved_at'
            )
        }),
        ('Delivery Settings', {
            'fields': ('send_email', 'send_sms', 'send_push')
        }),
        ('Analytics', {
            'fields': ('views_count', 'read_count', 'is_expired', 'is_published'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [NoticeAttachmentInline, NoticeRecipientInline]
    
    def author_name(self, obj):
        return obj.author.get_full_name() if obj.author else '-'
    author_name.short_description = 'Author'
    
    def is_published(self, obj):
        if obj.is_published:
            return format_html(
                '<span style="color: green;">✓ Published</span>'
            )
        elif obj.status == 'draft':
            return format_html(
                '<span style="color: orange;">Draft</span>'
            )
        elif obj.is_expired:
            return format_html(
                '<span style="color: red;">Expired</span>'
            )
        else:
            return format_html(
                '<span style="color: gray;">{}</span>',
                obj.get_status_display()
            )
    is_published.short_description = 'Status'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related and prefetch_related"""
        return super().get_queryset(request).select_related(
            'author', 'approved_by', 'category'
        ).prefetch_related(
            'target_classes', 'target_users'
        )
    
    def save_model(self, request, obj, form, change):
        """Set author if not set"""
        if not change:  # Only on creation
            obj.author = request.user
        super().save_model(request, obj, form, change)
    
    actions = ['approve_notices', 'reject_notices', 'mark_as_published', 'archive_notices']
    
    def approve_notices(self, request, queryset):
        """Approve selected notices"""
        updated = queryset.filter(status='draft').update(
            status='published',
            approved_by=request.user,
            approved_at=timezone.now()
        )
        self.message_user(
            request, 
            f'{updated} notices were successfully approved.'
        )
    approve_notices.short_description = 'Approve selected notices'
    
    def reject_notices(self, request, queryset):
        """Reject selected notices"""
        updated = queryset.filter(status='draft').update(
            status='draft',
            approved_by=None,
            approved_at=None
        )
        self.message_user(
            request, 
            f'{updated} notices were rejected.'
        )
    reject_notices.short_description = 'Reject selected notices'
    
    def mark_as_published(self, request, queryset):
        """Mark selected notices as published"""
        updated = queryset.update(status='published')
        self.message_user(
            request, 
            f'{updated} notices were marked as published.'
        )
    mark_as_published.short_description = 'Mark as published'
    
    def archive_notices(self, request, queryset):
        """Archive selected notices"""
        updated = queryset.update(status='archived')
        self.message_user(
            request, 
            f'{updated} notices were archived.'
        )
    archive_notices.short_description = 'Archive selected notices'


@admin.register(NoticeAttachment)
class NoticeAttachmentAdmin(admin.ModelAdmin):
    """Admin interface for NoticeAttachment"""
    
    list_display = [
        'filename', 'notice_title', 'file_type', 'file_size_mb',
        'description', 'created_at'
    ]
    list_filter = ['file_type', 'created_at']
    search_fields = ['filename', 'description', 'notice__title']
    ordering = ['-created_at']
    readonly_fields = ['file_size', 'created_at']
    
    fieldsets = (
        ('File Information', {
            'fields': ('notice', 'file', 'filename', 'file_type', 'file_size')
        }),
        ('Description', {
            'fields': ('description',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def notice_title(self, obj):
        return obj.notice.title if obj.notice else '-'
    notice_title.short_description = 'Notice'
    
    def file_size_mb(self, obj):
        if obj.file_size:
            return f"{round(obj.file_size / (1024 * 1024), 2)} MB"
        return '-'
    file_size_mb.short_description = 'Size (MB)'


@admin.register(NoticeRecipient)
class NoticeRecipientAdmin(admin.ModelAdmin):
    """Admin interface for NoticeRecipient"""
    
    list_display = [
        'user_name', 'user_email', 'notice_title', 'is_read',
        'email_sent', 'sms_sent', 'push_sent', 'read_at', 'created_at'
    ]
    list_filter = [
        'is_read', 'email_sent', 'sms_sent', 'push_sent', 'created_at'
    ]
    search_fields = [
        'user__first_name', 'user__last_name', 'user__email',
        'notice__title'
    ]
    ordering = ['-created_at']
    readonly_fields = [
        'user_name', 'user_email', 'notice_title', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Recipient Information', {
            'fields': ('user', 'user_name', 'user_email')
        }),
        ('Notice Information', {
            'fields': ('notice', 'notice_title')
        }),
        ('Delivery Status', {
            'fields': ('email_sent', 'sms_sent', 'push_sent')
        }),
        ('Read Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_name(self, obj):
        return obj.user.get_full_name() if obj.user else '-'
    user_name.short_description = 'User Name'
    
    def user_email(self, obj):
        return obj.user.email if obj.user else '-'
    user_email.short_description = 'Email'
    
    def notice_title(self, obj):
        return obj.notice.title if obj.notice else '-'
    notice_title.short_description = 'Notice'


@admin.register(NoticeTemplate)
class NoticeTemplateAdmin(admin.ModelAdmin):
    """Admin interface for NoticeTemplate"""
    
    list_display = [
        'name', 'category', 'created_by_name', 'is_active', 'created_at'
    ]
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'subject', 'content']
    ordering = ['name']
    readonly_fields = ['created_by_name', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'is_active')
        }),
        ('Template Content', {
            'fields': ('subject', 'content')
        }),
        ('Categorization', {
            'fields': ('category',)
        }),
        ('Creator', {
            'fields': ('created_by', 'created_by_name')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else '-'
    created_by_name.short_description = 'Created By'
    
    def save_model(self, request, obj, form, change):
        """Set created_by if not set"""
        if not change:  # Only on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
