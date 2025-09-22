import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for debounced search with fast results
 * Usage: const { searchResults, isSearching, search } = useDebounceSearch(300)
 */
export const useDebounceSearch = (delay = 300) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, delay)

    return () => clearTimeout(timer)
  }, [searchQuery, delay])

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      try {
        const results = await window.api.searchClients(debouncedQuery, 50)
        setSearchResults(results || [])
      } catch (error) {
        console.error('Search failed:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  const search = useCallback((query) => {
    setSearchQuery(query)
    if (query.trim()) {
      setIsSearching(true)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setDebouncedQuery('')
    setSearchResults([])
    setIsSearching(false)
  }, [])

  return {
    searchResults,
    isSearching,
    search,
    clearSearch,
    searchQuery
  }
}

/**
 * Custom hook for fast pagination
 * Usage: const { data, loading, loadMore, hasMore } = useFastPagination()
 */
export const useFastPagination = (filters = {}, limit = 50) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const loadData = useCallback(
    async (pageNum = 1, reset = false) => {
      setLoading(true)
      try {
        const result = await window.api.getClientsPaginated(pageNum, limit, filters)

        if (reset || pageNum === 1) {
          setData(result.clients)
        } else {
          setData((prev) => [...prev, ...result.clients])
        }

        setHasMore(result.hasMore)
        setTotal(result.total)
        setPage(pageNum)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    },
    [filters, limit]
  )

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadData(page + 1, false)
    }
  }, [loading, hasMore, page, loadData])

  const refresh = useCallback(() => {
    loadData(1, true)
  }, [loadData])

  // Load initial data
  useEffect(() => {
    loadData(1, true)
  }, [loadData])

  return {
    data,
    loading,
    loadMore,
    refresh,
    hasMore,
    total,
    page
  }
}

export default { useDebounceSearch, useFastPagination }
