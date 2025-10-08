from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'event_type', 'status', 'start_date', 'end_date',
        'venue', 'organizer', 'is_public', 'participant_count', 'created_at'
    ]
    list_filter = [
        'event_type', 'status', 'is_public', 'requires_registration',
        'start_date', 'created_at'
    ]
    search_fields = [
        'title', 'description', 'organizer', 'venue', 'contact_person',
        'contact_email', 'contact_phone'
    ]
    date_hierarchy = 'start_date'
    list_editable = ['status', 'is_public']
    readonly_fields = ['created_at', 'updated_at', 'participant_count']
    list_per_page = 25
    ordering = ['-start_date']

    fieldsets = (
        (_('Basic Information'), {
            'fields': ('title', 'description', 'event_type', 'status')
        }),
        (_('Date and Time'), {
            'fields': ('start_date', 'end_date', 'start_time', 'end_time')
        }),
        (_('Location'), {
            'fields': ('venue', 'address')
        }),
        (_('Organizer Details'), {
            'fields': (
                'organizer', 'contact_person', 'contact_email',
                'contact_phone'
            )
        }),
        (_('Participants'), {
            'fields': (
                'target_audience', 'max_participants', 'participant_count'
            )
        }),
        (_('Settings'), {
            'fields': (
                'is_public', 'requires_registration', 'registration_deadline'
            )
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def status_display(self, obj):
        """Display status with color coding"""
        colors = {
            'draft': 'gray',
            'published': 'green',
            'cancelled': 'red',
            'completed': 'blue'
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_display.short_description = _('Status')

    def participant_count(self, obj):
        """Display participant count"""
        # This would need to be implemented based on your model structure
        return "N/A"
    participant_count.short_description = _('Participants')

    actions = ['publish_events', 'cancel_events', 'mark_as_completed']

    def publish_events(self, request, queryset):
        """Publish selected events"""
        updated = queryset.filter(status='draft').update(status='published')
        message = (
            f'{updated} event{"s" if updated > 1 else ""} '
            'published successfully.'
        )
        self.message_user(request, message)
    publish_events.short_description = "Publish selected events"

    def cancel_events(self, request, queryset):
        """Cancel selected events"""
        updated = queryset.filter(
            status__in=['draft', 'published']
        ).update(status='cancelled')
        message = (
            f'{updated} event{"s" if updated > 1 else ""} '
            'cancelled successfully.'
        )
        self.message_user(request, message)
    cancel_events.short_description = "Cancel selected events"

    def mark_as_completed(self, request, queryset):
        """Mark selected events as completed"""
        updated = queryset.filter(
            status='published'
        ).update(status='completed')
        message = (
            f'{updated} event{"s" if updated > 1 else ""} '
            'marked as completed.'
        )
        self.message_user(request, message)
    mark_as_completed.short_description = "Mark as completed"
