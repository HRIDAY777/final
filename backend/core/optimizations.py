"""
Database query optimizations and performance utilities.
"""
from functools import wraps
from django.db import connection
from django.conf import settings
import logging
import time

logger = logging.getLogger(__name__)


def query_debugger(func):
    """Decorator to debug and log database queries."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        if settings.DEBUG:
            # Reset queries
            connection.queries_log.clear()
            
            # Track time
            start_time = time.time()
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Calculate duration
            duration = time.time() - start_time
            
            # Log query info
            query_count = len(connection.queries)
            
            if query_count > 0:
                total_query_time = sum(float(q['time']) for q in connection.queries)
                
                logger.debug(
                    f"Function: {func.__name__}\n"
                    f"Total Queries: {query_count}\n"
                    f"Total Query Time: {total_query_time:.4f}s\n"
                    f"Total Execution Time: {duration:.4f}s"
                )
                
                # Log slow queries
                for query in connection.queries:
                    query_time = float(query['time'])
                    if query_time > 0.1:  # Log queries > 100ms
                        logger.warning(
                            f"Slow Query ({query_time:.4f}s):\n{query['sql'][:200]}..."
                        )
            
            return result
        else:
            return func(*args, **kwargs)
    
    return wrapper


def optimize_queryset(queryset, select_related=None, prefetch_related=None):
    """
    Optimize queryset with select_related and prefetch_related.
    
    Usage:
        queryset = optimize_queryset(
            Student.objects.all(),
            select_related=['user', 'class_assigned'],
            prefetch_related=['subjects']
        )
    """
    if select_related:
        queryset = queryset.select_related(*select_related)
    
    if prefetch_related:
        queryset = queryset.prefetch_related(*prefetch_related)
    
    return queryset


class DatabaseQueryCounter:
    """Context manager to count database queries."""
    
    def __enter__(self):
        self.start_count = len(connection.queries)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_count = len(connection.queries)
        self.query_count = self.end_count - self.start_count
        
        if self.query_count > 10:
            logger.warning(f"High number of queries: {self.query_count}")


def bulk_create_optimized(model, objects, batch_size=1000):
    """
    Optimized bulk create with batching.
    
    Usage:
        students = [Student(...) for _ in range(10000)]
        bulk_create_optimized(Student, students)
    """
    created_objects = []
    
    for i in range(0, len(objects), batch_size):
        batch = objects[i:i + batch_size]
        created_objects.extend(
            model.objects.bulk_create(batch, batch_size=batch_size)
        )
    
    logger.info(f"Bulk created {len(created_objects)} {model.__name__} objects")
    return created_objects


def bulk_update_optimized(model, objects, fields, batch_size=1000):
    """
    Optimized bulk update with batching.
    
    Usage:
        students = Student.objects.filter(...)
        for student in students:
            student.status = 'active'
        bulk_update_optimized(Student, students, ['status'])
    """
    for i in range(0, len(objects), batch_size):
        batch = objects[i:i + batch_size]
        model.objects.bulk_update(batch, fields, batch_size=batch_size)
    
    logger.info(f"Bulk updated {len(objects)} {model.__name__} objects")


def get_or_create_cached(model, cache_key, defaults=None, **kwargs):
    """
    Get or create with caching.
    """
    from django.core.cache import cache
    
    # Try to get from cache
    obj = cache.get(cache_key)
    
    if obj is None:
        # Get or create from database
        obj, created = model.objects.get_or_create(defaults=defaults, **kwargs)
        
        # Cache for 1 hour
        cache.set(cache_key, obj, 3600)
        
        return obj, created
    
    return obj, False


def annotate_queryset_with_counts(queryset, related_fields):
    """
    Annotate queryset with counts of related fields.
    
    Usage:
        queryset = annotate_queryset_with_counts(
            Teacher.objects.all(),
            {'student': 'student_count', 'class': 'class_count'}
        )
    """
    from django.db.models import Count
    
    for field, annotation_name in related_fields.items():
        queryset = queryset.annotate(**{
            annotation_name: Count(field)
        })
    
    return queryset


def only_fields(queryset, fields):
    """
    Select only specific fields from queryset.
    
    Usage:
        students = only_fields(
            Student.objects.all(),
            ['id', 'first_name', 'last_name', 'email']
        )
    """
    return queryset.only(*fields)


def defer_fields(queryset, fields):
    """
    Defer loading of specific fields.
    
    Usage:
        students = defer_fields(
            Student.objects.all(),
            ['profile_picture', 'bio']
        )
    """
    return queryset.defer(*fields)


def exists_efficiently(queryset):
    """
    Efficiently check if queryset has any results.
    """
    return queryset.exists()


def count_efficiently(queryset):
    """
    Efficiently count queryset results.
    """
    # For small querysets, len() might be faster if already evaluated
    # For large querysets, count() is better
    if queryset._result_cache is not None:
        return len(queryset)
    return queryset.count()


class QuerysetCache:
    """
    Cache queryset results.
    
    Usage:
        cache = QuerysetCache(timeout=300)
        students = cache.get_or_set(
            'all_students',
            lambda: Student.objects.all()
        )
    """
    
    def __init__(self, timeout=300):
        from django.core.cache import cache
        self.cache = cache
        self.timeout = timeout
    
    def get_or_set(self, key, queryset_func):
        """Get from cache or execute queryset function."""
        result = self.cache.get(key)
        
        if result is None:
            result = list(queryset_func())
            self.cache.set(key, result, self.timeout)
        
        return result
    
    def invalidate(self, key):
        """Invalidate cache for a specific key."""
        self.cache.delete(key)


def chunk_queryset(queryset, chunk_size=1000):
    """
    Iterate over queryset in chunks.
    
    Usage:
        for students_batch in chunk_queryset(Student.objects.all(), 100):
            process_students(students_batch)
    """
    queryset = queryset.order_by('pk')
    last_pk = 0
    
    while True:
        chunk = list(
            queryset.filter(pk__gt=last_pk)[:chunk_size]
        )
        
        if not chunk:
            break
        
        yield chunk
        
        last_pk = chunk[-1].pk


def get_related_count(queryset, related_field):
    """
    Get count of related objects efficiently.
    
    Usage:
        teacher_count = get_related_count(Class.objects.all(), 'teachers')
    """
    from django.db.models import Count
    
    return queryset.aggregate(
        count=Count(related_field)
    )['count']

