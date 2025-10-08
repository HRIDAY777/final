from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import AcademicYear


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'start_date', 'end_date', 'duration_display', 'is_current',
        'is_active', 'created_at'
    ]
    list_filter = [
        'is_current', 'is_active', 'start_date', 'end_date', 'created_at'
    ]
    search_fields = ['name']
    list_editable = ['is_current', 'is_active']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-start_date']
    list_per_page = 25
    date_hierarchy = 'start_date'

    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'start_date', 'end_date')
        }),
        (_('Status'), {
            'fields': ('is_current', 'is_active')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def duration_display(self, obj):
        """Display the duration of the academic year in a readable format"""
        if obj.start_date and obj.end_date:
            duration = obj.end_date - obj.start_date
            days = duration.days
            years = days // 365
            months = (days % 365) // 30
            if years > 0:
                year_text = f"{years} year{'s' if years > 1 else ''}"
                month_text = f"{months} month{'s' if months > 1 else ''}"
                return f"{year_text} {month_text}"
            else:
                return f"{months} month{'s' if months > 1 else ''}"
        return "N/A"
    duration_display.short_description = _('Duration')

    actions = [
        'activate_academic_years', 'deactivate_academic_years',
        'set_as_current'
    ]

    def activate_academic_years(self, request, queryset):
        """Activate selected academic years"""
        updated = queryset.update(is_active=True)
        message = f'{updated} academic year{"s" if updated > 1 else ""} '
        message += 'activated successfully.'
        self.message_user(request, message)
    activate_academic_years.short_description = (
        "Activate selected academic years"
    )

    def deactivate_academic_years(self, request, queryset):
        """Deactivate selected academic years"""
        updated = queryset.update(is_active=False)
        message = f'{updated} academic year{"s" if updated > 1 else ""} '
        message += 'deactivated successfully.'
        self.message_user(request, message)
    deactivate_academic_years.short_description = (
        "Deactivate selected academic years"
    )

    def set_as_current(self, request, queryset):
        """Set selected academic year as current (only one can be current)"""
        if queryset.count() > 1:
            message = 'Only one academic year can be set as current at a time.'
            self.message_user(request, message, level='ERROR')
            return

        # First, set all academic years as not current
        AcademicYear.objects.filter(is_current=True).update(is_current=False)

        # Then set the selected one as current
        updated = queryset.update(is_current=True)
        message = f'{updated} academic year set as current successfully.'
        self.message_user(request, message)
    set_as_current.short_description = "Set as current academic year"
