from django.contrib import admin
from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'event_type', 'status', 'start_date', 'end_date',
        'venue', 'organizer', 'is_public'
    )
    list_filter = (
        'event_type', 'status', 'is_public', 'requires_registration',
        'start_date'
    )
    search_fields = (
        'title', 'description', 'organizer', 'venue', 'contact_person'
    )
    date_hierarchy = 'start_date'
    list_editable = ('status', 'is_public')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'event_type', 'status')
        }),
        ('Date and Time', {
            'fields': ('start_date', 'end_date', 'start_time', 'end_time')
        }),
        ('Location', {
            'fields': ('venue', 'address')
        }),
        ('Organizer Details', {
            'fields': (
                'organizer', 'contact_person', 'contact_email',
                'contact_phone'
            )
        }),
        ('Participants', {
            'fields': ('target_audience', 'max_participants')
        }),
        ('Settings', {
            'fields': (
                'is_public', 'requires_registration', 'registration_deadline'
            )
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
